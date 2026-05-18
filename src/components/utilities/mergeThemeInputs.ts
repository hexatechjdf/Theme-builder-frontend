export const mergeThemeInputs = (
  defaultInputs: Record<string, { label: string; pre: string; current: string }>,
  updatedRoots: Record<string, string>
) => {
  return Object.fromEntries(
    Object.entries(defaultInputs).map(([key, config]) => [
      key,
      {
        ...config,
        current: updatedRoots[key] ?? config.current,
      },
    ])
  );
};
