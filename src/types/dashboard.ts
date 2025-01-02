export interface DashboardStats {
  totalCalories: number;
  totalBurned: number;
  netCalories: number;
  goalProgress: number;
}

export interface WeeklyData {
  date: string;
  consumed: number;
  burned: number;
}

export interface Challenge {
  title: string;
  progress: number;
  daysLeft: number;
  thumbnail: string;
} 