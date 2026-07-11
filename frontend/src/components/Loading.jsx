function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

      <p className="mt-6 text-lg font-semibold text-gray-700">
        AI is analyzing the company...
      </p>

      <p className="text-gray-500 mt-2">
        Fetching market data, news and generating insights...
      </p>
    </div>
  );
}

export default Loading;