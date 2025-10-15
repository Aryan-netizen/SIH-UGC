export interface UGCCriteria {
  _id: string;
  title: string;
  description: string;
  minimumRequirements: string;
  evaluationPoints: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CollegeApplication {
  _id: string;
  collegeName: string;
  establishedYear?: number;
  address?: string;
  affiliatedUniversity?: string;
  infrastructure: string;
  facultyDetails: string;
  accreditations?: string;
  facilities?: string;
  studentCapacity?: number;
  coursesOffered?: string;
  financialStatus?: string;
  additionalInfo?: string;
  status: ApplicationStatus;
  remarks?: string;
  aiEvaluation?: {
    score: number;
    recommendation: string;
    reasoning: string;
    evaluatedAt: Date;
  };
}

export interface EvaluateRequest {
  applicationId: string;
  criteriaId?: string;
}

export interface BatchEvaluateRequest {
  criteriaId?: string;
}

export interface StatusUpdateRequest {
  status: ApplicationStatus;
  remarks: string;
}
