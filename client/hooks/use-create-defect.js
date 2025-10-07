import { useMutation } from "@tanstack/react-query";

export const useCreateDefect = () => {
  return useMutation({
    mutationFn: (newDefect) => {
      return fetch("/api/defects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDefect)
      }).then(res => res.json());
    }
  });
};
