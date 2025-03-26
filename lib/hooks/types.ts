// types.ts
export type Edit = {
    start: number;
    end: number;
    type: "trim" | "splice";
  };