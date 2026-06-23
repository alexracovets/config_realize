interface headerConfigItemType {
  value: string;
  label: string;
  content: React.ComponentType;
  step: number;
  disabled?: boolean;
}

export type { headerConfigItemType };
