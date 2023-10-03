type DataHookOutput<T> = T & {
  isLoading: boolean;
  isError: boolean;
};
