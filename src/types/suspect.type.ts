export interface SuspectDetails {
    id: number;
    username: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    national_id: string;
    role: number;
    role_title: string;
}

export interface Suspect {
    id: number;
    suspect_details: SuspectDetails;
    crime_title: string;
    crime_level: string;
    status: 'suspect' | 'captured' | 'cleared'; // Assuming possible statuses based on "suspect"
    wanted_since: string;
    priority_score: number;
    reward_amount: number;
}
