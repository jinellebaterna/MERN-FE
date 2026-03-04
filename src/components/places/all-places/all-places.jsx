import { useInfiniteQuery } from "@tanstack/react-query";
import { searchPlaces } from "../../../api/places";
import PlaceCard from "../place-card/place-card";
import "./all-places.css";

const AllPlaces = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["places", "all"],
    queryFn: ({ pageParam }) => searchPlaces({ page: pageParam, limit: 9 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });

  const places = data?.pages.flatMap((page) => page.places) ?? [];

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong.</p>;

  return (
    <>
      <ul className="all-places-list">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            id={place.id}
            title={place.title}
            address={place.address}
            image={place.image}
          />
        ))}
      </ul>
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </>
  );
};

export default AllPlaces;
