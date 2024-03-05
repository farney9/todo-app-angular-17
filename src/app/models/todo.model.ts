export interface TodoModel {
  id: number;
  title: string;
  isCompleted: boolean;
  isEditing?: boolean;
}

export type Filtertype = 'all' | 'active' | 'completed';
