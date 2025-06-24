export const getVideoId = () => {
  const url = new URL(location.href);
  return url.searchParams.get("v");
};
