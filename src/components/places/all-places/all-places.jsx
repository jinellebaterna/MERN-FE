import { useState, useContext } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchPopularPlaces, searchPlaces } from "../../../api/places";
import PlaceCard from "../place-card/place-card";
import Button from "../../shared/components/button/button";
import { ChevronDown } from "lucide-react";
import { AuthContext } from "../../shared/context/auth-context";
import "./all-places.css";

const AllPlaces = () => {
  const [activeTag, setActiveTag] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const auth = useContext(AuthContext);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["places", "all", activeTag],
    queryFn: ({ pageParam }) =>
      searchPlaces({ page: pageParam, limit: 9, tag: activeTag ?? "" }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });

  const { data: popularPlaces = [] } = useQuery({
    queryKey: ["places", "popular"],
    queryFn: () => fetchPopularPlaces(6),
  });

  const allPlaces = data?.pages.flatMap((page) => page.places) ?? [];
  const allTags = [...new Set(allPlaces.flatMap((p) => p.tags ?? []))];

  const places = auth.userId
    ? allPlaces.filter((p) => {
        if (statusFilter === "visited")
          return p.visitedBy?.includes(auth.userId);
        if (statusFilter === "want")
          return p.wantToVisitBy?.includes(auth.userId);
        return true;
      })
    : allPlaces;

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong.</p>;

  return (
    <>
      {popularPlaces.length > 0 && (
        <section className="popular-section">
          <h2>Popular Places</h2>
          <ul className="popular-list">
            {popularPlaces.map((place) => (
              <PlaceCard
                key={place.id || place._id}
                id={place.id || place._id}
                title={place.title}
                address={place.address}
                images={place.images}
                tags={place.tags}
                onTagClick={setActiveTag}
              />
            ))}
          </ul>
        </section>
      )}

      {auth.isLoggedIn && (
        <div className="status-filters">
          {["all", "visited", "want"].map((f) => (
            <span
              key={f}
              className={`filter-chip ${statusFilter === f ? "filter-chip--active" : ""}`}
              onClick={() => setStatusFilter(f)}
            >
              {f === "all"
                ? "All"
                : f === "visited"
                  ? "✓ Visited"
                  : "♡ Want to Visit"}
            </span>
          ))}
        </div>
      )}

      {allTags.length > 0 && (
        <div className="tag-filters">
          <span
            className={`filter-chip ${!activeTag ? "filter-chip--active" : ""}`}
            onClick={() => setActiveTag(null)}
          >
            All
          </span>
          {allTags.map((tag) => (
            <span
              key={tag}
              className={`filter-chip ${activeTag === tag ? "filter-chip--active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <ul className="all-places-list">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            id={place.id}
            title={place.title}
            address={place.address}
            images={place.images}
            tags={place.tags}
            visitedBy={place.visitedBy}
            wantToVisitBy={place.wantToVisitBy}
            onTagClick={setActiveTag}
          />
        ))}
      </ul>
      {hasNextPage && (
        <div className="all-places__load-more">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            <ChevronDown size={16} />
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </>
  );
};

export default AllPlaces;
