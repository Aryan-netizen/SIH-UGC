const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
require("dotenv").config();
// Add this after requiring dependencies in your backend
const cors = require('cors');

const app = express();
// Add this after app initialization
app.use(cors({
  origin: 'https://sih-ugc-xvfq.vercel.app/', // Next.js default port
  credentials: true
}));

app.use(bodyParser.json());

// ---- Connect MongoDB ----
mongoose.connect(process.env.MONGOOSE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ---- Define Schemas ----
const UGCCriteriaSchema = new mongoose.Schema({
  title: String,
  description: String,
  minimumRequirements: String,
  evaluationPoints: [String],
}, { timestamps: true });

const CollegeApplicationSchema = new mongoose.Schema({
  collegeName: String,
  establishedYear: Number,
  address: String,
  affiliatedUniversity: String,
  infrastructure: String,
  facultyDetails: String,
  accreditations: String,
  facilities: String,
  studentCapacity: Number,
  coursesOffered: String,
  financialStatus: String,
  additionalInfo: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending'
  },
  aiEvaluation: {
    score: Number,
    recommendation: String,
    reasoning: String,
    evaluatedAt: Date
  }
}, { timestamps: true });

const UGCCriteria = mongoose.model("UGCCriteria", UGCCriteriaSchema);
const CollegeApplication = mongoose.model("CollegeApplication", CollegeApplicationSchema);

// ---- AI setup ----
let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not found in environment variables");
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (err) {
  console.error("❌ AI initialization error:", err.message);
  process.exit(1);
}

// ---- UGC Criteria Routes ----
app.post("/criteria", async (req, res) => {
  try {
    const { title, description, minimumRequirements, evaluationPoints } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description required" });
    }
    const criteria = new UGCCriteria({ 
      title, 
      description, 
      minimumRequirements,
      evaluationPoints 
    });
    await criteria.save();
    res.status(201).json(criteria);
  } catch (err) {
    console.error("Error creating criteria:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/criteria", async (req, res) => {
  try {
    const criteria = await UGCCriteria.find();
    res.json(criteria);
  } catch (err) {
    console.error("Error fetching criteria:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/criteria/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid criteria ID format" });
    }
    
    const criteria = await UGCCriteria.findById(req.params.id);
    if (!criteria) return res.status(404).json({ error: "Criteria not found" });
    res.json(criteria);
  } catch (err) {
    console.error("Error fetching criteria:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---- College Application Routes ----
app.post("/applications", async (req, res) => {
  try {
    const { 
      collegeName, 
      establishedYear,
      address,
      affiliatedUniversity,
      infrastructure, 
      facultyDetails,
      accreditations,
      facilities,
      studentCapacity,
      coursesOffered,
      financialStatus,
      additionalInfo
    } = req.body;
    
    if (!collegeName || !infrastructure || !facultyDetails) {
      return res.status(400).json({ 
        error: "College name, infrastructure, and faculty details are required" 
      });
    }
    
    const application = new CollegeApplication({ 
      collegeName,
      establishedYear,
      address,
      affiliatedUniversity,
      infrastructure, 
      facultyDetails,
      accreditations,
      facilities,
      studentCapacity,
      coursesOffered,
      financialStatus,
      additionalInfo,
      status: 'pending'
    });
    
    await application.save();
    res.status(201).json(application);
  } catch (err) {
    console.error("Error creating application:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/applications", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const applications = await CollegeApplication.find(filter).sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/applications/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid application ID format" });
    }
    
    const application = await CollegeApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ error: "Application not found" });
    res.json(application);
  } catch (err) {
    console.error("Error fetching application:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---- AI Evaluation Route ----
app.post("/evaluate", async (req, res) => {
  try {
    const { applicationId, criteriaId } = req.body;
    
    if (!applicationId) {
      return res.status(400).json({ error: "applicationId required" });
    }

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ error: "Invalid application ID format" });
    }

    const application = await CollegeApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Get criteria if provided, otherwise use default evaluation
    let criteria = null;
    if (criteriaId) {
      if (!mongoose.Types.ObjectId.isValid(criteriaId)) {
        return res.status(400).json({ error: "Invalid criteria ID format" });
      }
      criteria = await UGCCriteria.findById(criteriaId);
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 500,
      }
    });

    // Build comprehensive application details
    const applicationDetails = `
College Name: ${application.collegeName}
Established Year: ${application.establishedYear || 'Not specified'}
Address: ${application.address || 'Not specified'}
Affiliated University: ${application.affiliatedUniversity || 'Not specified'}
Infrastructure: ${application.infrastructure}
Faculty Details: ${application.facultyDetails}
Accreditations: ${application.accreditations || 'None specified'}
Facilities: ${application.facilities || 'Not specified'}
Student Capacity: ${application.studentCapacity || 'Not specified'}
Courses Offered: ${application.coursesOffered || 'Not specified'}
Financial Status: ${application.financialStatus || 'Not specified'}
Additional Information: ${application.additionalInfo || 'None'}
    `.trim();

    const criteriaText = criteria 
      ? `
UGC Criteria: ${criteria.title}
Description: ${criteria.description}
Minimum Requirements: ${criteria.minimumRequirements || 'Standard UGC norms'}
Evaluation Points: ${criteria.evaluationPoints?.join(', ') || 'Standard evaluation'}
      `
      : `
UGC Standard Criteria:
- Adequate infrastructure and facilities
- Qualified faculty with proper credentials
- Financial stability
- Proper accreditation and affiliations
- Student welfare facilities
- Quality education standards
      `;

    const prompt = `You are a UGC (University Grants Commission) evaluation expert. Evaluate this college application for UGC approval. you are very strict in your evaluation, you donot aprove fishy colleges

${criteriaText}

College Application:
${applicationDetails}

Provide your evaluation in the following format:
Score: [0-100]
Recommendation: [APPROVE/REJECT/NEEDS_IMPROVEMENT]
Reasoning: [Detailed explanation in 3-4 sentences covering strengths, weaknesses, and specific areas of concern or excellence]

Be thorough and consider all aspects: infrastructure, faculty qualifications, facilities, financial stability, and compliance with UGC norms. and be strict in evaluation poor colleges are poor and best colleges are best`;

    try {
      console.log(`Evaluating application for: ${application.collegeName}`);
      
      const result = await model.generateContent(prompt);
      
      if (!result || !result.response) {
        throw new Error("Empty response from AI model");
      }
      
      const response = result.response;
      let text;
      
      // Handle different response formats
      if (typeof response.text === 'function') {
        text = await response.text();
      } else if (response.text) {
        text = response.text;
      } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        text = response.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Unable to extract text from AI response");
      }

      if (!text || text.trim().length === 0) {
        throw new Error("AI returned empty response");
      }

      // Parse AI response
      const scoreMatch = text.match(/Score:\s*(\d+)/i);
      const recommendationMatch = text.match(/Recommendation:\s*(APPROVE|REJECT|NEEDS_IMPROVEMENT)/i);
      const reasoningMatch = text.match(/Reasoning:\s*(.+)/is);

      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      const recommendation = recommendationMatch ? recommendationMatch[1] : 'NEEDS_IMPROVEMENT';
      const reasoning = reasoningMatch ? reasoningMatch[1].trim() : text;

      // Update application with AI evaluation
      application.aiEvaluation = {
        score,
        recommendation,
        reasoning,
        evaluatedAt: new Date()
      };
      
      application.status = 'under_review';
      await application.save();

      console.log(`✅ Successfully evaluated application: ${application.collegeName}`);

      res.json({ 
        application,
        evaluation: {
          score,
          recommendation,
          reasoning,
          fullResponse: text.trim()
        }
      });
      
    } catch (aiErr) {
      console.error(`❌ AI error for application ${application.collegeName}:`, {
        message: aiErr.message,
        stack: aiErr.stack
      });
      
      // Fallback basic evaluation
      const fallbackScore = calculateBasicScore(application);
      const fallbackRecommendation = fallbackScore >= 70 ? 'APPROVE' : fallbackScore >= 50 ? 'NEEDS_IMPROVEMENT' : 'REJECT';
      
      application.aiEvaluation = {
        score: fallbackScore,
        recommendation: fallbackRecommendation,
        reasoning: "Basic evaluation used (AI temporarily unavailable). Manual review recommended.",
        evaluatedAt: new Date()
      };
      application.status = 'under_review';
      await application.save();

      res.json({ 
        application,
        evaluation: {
          score: fallbackScore,
          recommendation: fallbackRecommendation,
          reasoning: "Basic evaluation completed. AI service unavailable - manual review recommended.",
          fallback: true
        }
      });
    }

  } catch (err) {
    console.error("Error in evaluation:", err);
    res.status(500).json({ error: err.message });
  }
});

// Batch evaluation for multiple applications
app.post("/evaluate-batch", async (req, res) => {
  try {
    const { criteriaId } = req.body;
    
    const applications = await CollegeApplication.find({ status: 'pending' });
    
    if (applications.length === 0) {
      return res.json({ message: "No pending applications found", evaluations: [] });
    }

    const results = [];

    for (let application of applications) {
      try {
        // Reuse the evaluation logic
        const evalResult = await evaluateApplication(application, criteriaId);
        results.push(evalResult);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Error evaluating ${application.collegeName}:`, err.message);
        results.push({
          applicationId: application._id,
          collegeName: application.collegeName,
          error: err.message
        });
      }
    }

    res.json({ 
      message: `Evaluated ${results.length} applications`,
      evaluations: results 
    });

  } catch (err) {
    console.error("Error in batch evaluation:", err);
    res.status(500).json({ error: err.message });
  }
});

// Manual approval/rejection by UGC officer
app.patch("/applications/:id/status", async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid application ID format" });
    }

    if (!['approved', 'rejected', 'under_review', 'pending'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const application = await CollegeApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    application.status = status;
    if (remarks && application.aiEvaluation) {
      application.aiEvaluation.reasoning = `${application.aiEvaluation.reasoning}\n\nOfficer Remarks: ${remarks}`;
    }
    
    await application.save();
    res.json(application);

  } catch (err) {
    console.error("Error updating application status:", err);
    res.status(500).json({ error: err.message });
  }
});

// Helper function for basic scoring
function calculateBasicScore(application) {
  let score = 0;
  
  if (application.infrastructure && application.infrastructure.length > 50) score += 20;
  if (application.facultyDetails && application.facultyDetails.length > 50) score += 20;
  if (application.accreditations && application.accreditations.length > 10) score += 15;
  if (application.facilities && application.facilities.length > 30) score += 15;
  if (application.establishedYear && application.establishedYear < 2020) score += 10;
  if (application.affiliatedUniversity && application.affiliatedUniversity.length > 5) score += 10;
  if (application.studentCapacity && application.studentCapacity > 100) score += 10;
  
  return Math.min(score, 100);
}

// Helper function for evaluation (used in batch processing)
async function evaluateApplication(application, criteriaId) {
  // This is a simplified version - in production, you'd want to refactor the evaluation logic
  // into a shared function to avoid code duplication
  return {
    applicationId: application._id,
    collegeName: application.collegeName,
    status: 'evaluated'
  };
}

// ---- Error handling middleware ----
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ---- Start Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 UGC College Approval System running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("  POST /criteria - Create UGC evaluation criteria");
  console.log("  GET /criteria - Get all criteria");
  console.log("  GET /criteria/:id - Get specific criteria");
  console.log("  POST /applications - Submit college application");
  console.log("  GET /applications - Get all applications (filter by ?status=pending)");
  console.log("  GET /applications/:id - Get specific application");
  console.log("  POST /evaluate - AI evaluate single application");
  console.log("  POST /evaluate-batch - AI evaluate all pending applications");
  console.log("  PATCH /applications/:id/status - Manually update application status");
});