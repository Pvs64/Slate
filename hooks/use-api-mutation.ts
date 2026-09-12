import { useState } from "react";
import { useMutation } from "convex/react";
import type { FunctionReference } from "convex/server";

export const useApiMutation = <Args extends Record<string, unknown>, Result>(mutationFunction: FunctionReference<"mutation", "public", Args, Result>) => {
  const [pending, setPending] = useState(false);

  const apiMutation = useMutation(mutationFunction);

  const mutate = (payload: Args) => {
    setPending(true);
    return apiMutation(payload as never)
      .finally(() => setPending(false))
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw error;
      });
  };

  return {
    mutate,
    pending,
  };
};
