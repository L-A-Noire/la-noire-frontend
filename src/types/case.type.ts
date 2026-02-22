/**
 * Case - Basic/List response from API
 * Used in list endpoints and as basic response
 */
export interface Case {
  id: number;
  created_at: string;
  is_from_crime_scene: boolean;
  is_closed: boolean;
  crime: number;
  detective: number;
}

/**
 * CaseDetail - Extended response with denormalized fields
 * Used when fetching a single case by ID
 */
export interface CaseDetail extends Case {
  detective_name?: string;
  detective_details?: {
    id: number;
    name: string;
    email?: string;
  };
  crime_title?: string;
  crime_details?: {
    id: number;
    title: string;
    description?: string;
  };
}

/**
 * CaseList - Summary view for list displays
 * Contains only necessary fields for list rendering
 */
export interface CaseList {
  id: number;
  created_at: string;
  is_from_crime_scene: boolean;
  is_closed: boolean;
  detective_name: string;
  crime_title: string;
}

/**
 * CreateCaseRequest - Request body for creating a new case
 */
export interface CreateCaseRequest {
  is_from_crime_scene: boolean;
  crime: number;
  detective: number;
}

/**
 * UpdateCaseRequest - Request body for full update (PUT)
 */
export interface UpdateCaseRequest extends CreateCaseRequest {
  is_closed: boolean;
}

/**
 * PatchCaseRequest - Request body for partial update (PATCH)
 */
export type PatchCaseRequest = Partial<UpdateCaseRequest>;

/**
 * AssignDetectiveRequest - Request body for assign_detective endpoint
 */
export interface AssignDetectiveRequest {
  detective: number;
}

/**
 * CloseCaseRequest - Request body for close_case endpoint
 */
export interface CloseCaseRequest {
  is_closed: true;
}

/**
 * CaseTimeline - Timeline events for a case
 * Contains investigation events, complaints, crime scenes, reports
 * Extends CaseDetail to include denormalized fields
 */
export interface CaseTimeline extends CaseDetail {
  timeline_events?: Array<{
    id: number;
    timestamp: string;
    event_type: "complaint" | "crime_scene" | "report" | "update";
    description: string;
  }>;
}
