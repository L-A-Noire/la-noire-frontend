export interface Case {
  id: number;
  created_at: string;
  is_from_crime_scene: boolean;
  is_closed: boolean;
  detective_name?: string;
  crime_title?: string;
  // properties from raw response
  crime?: number;
  detective?: number;
}

export interface CreateCaseRequest {
  is_from_crime_scene: boolean;
  is_closed: boolean;
  crime: number;
  detective: number;
}

export type UpdateCaseRequest = Partial<CreateCaseRequest>;

export interface AssignDetectiveRequest {
  detective: number;
}

export interface CloseCaseRequest {
  is_closed: boolean; // Assuming passing true closes it
}

export interface CaseTimeline {
  // The user didn't specify the structure of timeline items, but said "complaints, crime scenes, reports"
  // and showed the Case object as response example which seems wrong for a list of timeline events.
  // I'll assume it returns a list of events or the case object itself?
  // "Case timeline (complaints, crime scenes, reports) ... Response: { "id": 0 ... }"
  // Wait, the documentation example response for timeline is just the Case object again?
  // That might be a copy-paste error in the user's prompt or the API returns the Case with populated timeline fields.
  // I will type it as `any` for now or `Case` if it matches, to be safe.
  // Actually, looking closely at the user prompt:
  /*
    GET /api/crime/cases/{id}/timeline/
    Case timeline (complaints, crime scenes, reports)
    Response:
    {
      "id": 0,
      ...
    }
    */
  // It looks like it returns the case details, maybe with extra fields not shown?
  // Or maybe it returns a list? The example shows a single object.
  // I'll stick to `Case` for now.
  [key: string]: any;
}
