import { useState, useEffect, useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../context/auth-context";
import {
  addUserCountry,
  removeFromWishlist,
  updateWishlistDetails,
} from "../../api/user";
import {
  geocodeAddress,
  fetchMonthlyClimate,
  fetchCountryInfo,
  fetchWeather,
  getBestMonths,
} from "../../api/weather";
import { getFlagEmoji } from "../../utils/flags";
import { WMO_CODES } from "../../data/data";
import ClimateChart from "../climate-chart/climate-chart";

const WishlistModal = ({ country: initialCountry, canEdit, onClose }) => {
  const auth = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [coords, setCoords] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);
  const [bestMonths, setBestMonths] = useState(null);
  const [weather, setWeather] = useState(null);
  const [notesDraft, setNotesDraft] = useState(initialCountry.notes || "");
  const [priorityDraft, setPriorityDraft] = useState(
    initialCountry.priority || "medium"
  );
  const [targetYearDraft, setTargetYearDraft] = useState(
    initialCountry.targetYear ? String(initialCountry.targetYear) : ""
  );
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [country, setCountry] = useState(initialCountry);
  const [infoLoading, setInfoLoading] = useState(true);

  useEffect(() => {
    fetchCountryInfo(country.code)
      .then(setCountryInfo)
      .catch(() => {});

    geocodeAddress(country.name)
      .then(async ({ lat, lon }) => {
        setCoords({ lat, lon });
        fetchWeather(lat, lon)
          .then(setWeather)
          .catch(() => {});
        const climate = await fetchMonthlyClimate(lat, lon);
        setBestMonths(getBestMonths(climate));
      })
      .catch(() => {})
      .finally(() => setInfoLoading(false));
  }, [country.code, country.name]);

  const removeMutation = useMutation({
    mutationFn: (code) =>
      removeFromWishlist({ userId: auth.userId, code, token: auth.token }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["wishlist", auth.userId] }),
  });

  const markVisitedMutation = useMutation({
    mutationFn: ({ name, code }) =>
      addUserCountry({ userId: auth.userId, name, code, token: auth.token }),
    onSuccess: (_, { code }) => {
      removeMutation.mutate(code);
      queryClient.invalidateQueries({ queryKey: ["countries", auth.userId] });
      onClose();
    },
  });

  const detailsMutation = useMutation({
    mutationFn: ({ code, notes, priority, targetYear }) =>
      updateWishlistDetails({
        userId: auth.userId,
        code,
        notes,
        priority,
        targetYear,
        token: auth.token,
      }),
    onSuccess: (data) => {
      setCountry((prev) => ({ ...prev, ...data.country }));
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 1500);
    },
  });

  return (
    <div className="country-modal__backdrop" onClick={onClose}>
      <div className="country-modal" onClick={(e) => e.stopPropagation()}>
        <div className="country-modal__header">
          <span className="country-modal__flag">
            {getFlagEmoji(country.code)}
          </span>
          <h3>{country.name}</h3>
          <button className="country-modal__close" onClick={onClose}>
            &times;
          </button>
        </div>

        {infoLoading ? (
          <div className="wishlist-modal__info-strip wishlist-modal__info-strip--loading">
            <span className="wishlist-modal__info-skel" />
            <span className="wishlist-modal__info-skel" />
            <span className="wishlist-modal__info-skel" />
          </div>
        ) : bestMonths || countryInfo || weather ? (
          <div className="wishlist-modal__info-strip">
            {bestMonths && <span>📅 Best Time: {bestMonths}</span>}
            {countryInfo?.currency && (
              <span>💰 Currency: {countryInfo.currency}</span>
            )}
            {countryInfo?.language && (
              <span>🗣 Language: {countryInfo.language}</span>
            )}
            {weather && (
              <span>
                {WMO_CODES[weather.weather_code] ?? "🌡️  "}{" "}
                {weather.temperature_2m}°
              </span>
            )}
          </div>
        ) : null}

        <div className="country-modal__body">
          <ClimateChart lat={coords?.lat} lon={coords?.lon} />

          {canEdit && savedIndicator && (
            <span className="wishlist-modal__saved">Saved ✓</span>
          )}

          {canEdit && (
            <div className="wishlist-modal__planning">
              <div className="wishlist-modal__field">
                <label>🔥 Priority</label>
                <select
                  value={priorityDraft}
                  onChange={(e) => {
                    setPriorityDraft(e.target.value);
                    detailsMutation.mutate({
                      code: country.code,
                      notes: notesDraft,
                      priority: e.target.value,
                      targetYear: targetYearDraft
                        ? Number(targetYearDraft)
                        : null,
                    });
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="wishlist-modal__field">
                <label>🎯 Target Year</label>
                <input
                  type="number"
                  value={targetYearDraft}
                  min={new Date().getFullYear()}
                  max={2100}
                  placeholder="e.g. 2027"
                  onChange={(e) => setTargetYearDraft(e.target.value)}
                  onBlur={() =>
                    detailsMutation.mutate({
                      code: country.code,
                      notes: notesDraft,
                      priority: priorityDraft,
                      targetYear: targetYearDraft
                        ? Number(targetYearDraft)
                        : null,
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="country-modal__notes">
            <h4>📝 Notes</h4>
            {canEdit ? (
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Why do you want to visit? What do you want to do there?"
                rows={3}
                onBlur={() => {
                  if (notesDraft !== (country.notes || ""))
                    detailsMutation.mutate({
                      code: country.code,
                      notes: notesDraft,
                      priority: priorityDraft,
                      targetYear: targetYearDraft
                        ? Number(targetYearDraft)
                        : null,
                    });
                }}
              />
            ) : (
              <p>{country.notes || "No notes."}</p>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="country-modal__actions">
            <button
              className="country-modal__btn country-modal__btn--save"
              onClick={() =>
                markVisitedMutation.mutate({
                  name: country.name,
                  code: country.code,
                })
              }
              disabled={
                markVisitedMutation.isPending || removeMutation.isPending
              }
            >
              {markVisitedMutation.isPending
                ? "Moving..."
                : "✓ Mark as Visited"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistModal;
