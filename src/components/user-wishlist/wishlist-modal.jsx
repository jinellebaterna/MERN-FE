import { useState, useEffect, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../context/auth-context";
import {
  addUserCountry,
  removeFromWishlist,
  updateWishlistDetails,
} from "../../api/user";
import {
  geocodeAddress,
  fetchCountryInfo,
  fetchWeather,
  getBestMonths,
  fetchMonthlyClimate,
  fetchVisaRequirement,
  fetchExchangeRate,
} from "../../api/weather";
import { getFlagEmoji } from "../../utils/flags";
import { WMO_CODES, PRIORITY_OPTIONS, CACHE_DURATIONS, COUNTRIES } from "../../data/data";
import ClimateChart from "../climate-chart/climate-chart";

const buildFlightLinks = (countryName, countryCode) => ({
  google: `https://www.google.com/travel/flights?q=flights+to+${encodeURIComponent(countryName)}`,
  skyscanner: `https://www.skyscanner.com/flights-to/${countryCode.toLowerCase()}/`,
});

const VISA_BADGE = {
  VF: { label: "Visa Free", cls: "vf" },
  VOA: { label: "Visa on Arrival", cls: "voa" },
  ETA: { label: "eVisa", cls: "eta" },
  VR: { label: "Visa Required", cls: "vr" },
  NA: { label: "No Admission", cls: "na" },
  citizen: { label: "Your Country", cls: "vf" },
};

const getVisaBadge = (req) => {
  if (!req) return null;
  if (VISA_BADGE[req]) return VISA_BADGE[req];
  const n = Number(req);
  if (!isNaN(n) && n > 0) return { label: `Visa Free · ${n} days`, cls: "vf" };
  return { label: req, cls: "vf" };
};

const WishlistModal = ({ country: initialCountry, canEdit, onClose }) => {
  const auth = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [coords, setCoords] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);
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
        const weatherData = await fetchWeather(lat, lon).catch(() => null);
        setWeather(weatherData);
      })
      .catch(() => {})
      .finally(() => setInfoLoading(false));
  }, [country.code, country.name]);

  const { data: climateData } = useQuery({
    queryKey: ["climate", coords?.lat, coords?.lon],
    queryFn: () => fetchMonthlyClimate(coords.lat, coords.lon),
    enabled: !!coords,
    staleTime: CACHE_DURATIONS.CLIMATE,
  });
  const bestMonths = climateData ? getBestMonths(climateData) : null;

  const passportName = auth.passportCountry
    ? COUNTRIES.find((c) => c.code === auth.passportCountry)?.name ?? null
    : null;

  const { data: visaReq, isLoading: visaLoading } = useQuery({
    queryKey: ["visa", passportName, country.name],
    queryFn: () => fetchVisaRequirement(passportName, country.name),
    enabled: !!passportName,
    staleTime: Infinity,
  });
  const visaBadge = passportName ? getVisaBadge(visaReq) : null;

  const [converterAmount, setConverterAmount] = useState("100");

  const { data: homeInfo } = useQuery({
    queryKey: ["countryInfo", auth.passportCountry],
    queryFn: () => fetchCountryInfo(auth.passportCountry),
    enabled: !!auth.passportCountry,
    staleTime: CACHE_DURATIONS.CLIMATE,
  });

  const homeCurrencyCode = homeInfo?.currencyCode ?? null;
  const destCurrencyCode = countryInfo?.currencyCode ?? null;

  const { data: exchangeRate } = useQuery({
    queryKey: ["exchangeRate", homeCurrencyCode, destCurrencyCode],
    queryFn: () => fetchExchangeRate(homeCurrencyCode, destCurrencyCode),
    enabled: !!homeCurrencyCode && !!destCurrencyCode,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const convertedAmount =
    exchangeRate != null && converterAmount !== ""
      ? (parseFloat(converterAmount) * exchangeRate).toFixed(2)
      : null;

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

        <div className="country-modal__body country-modal__body--wishlist">
          {(() => {
            const { google, skyscanner } = buildFlightLinks(country.name, country.code);
            return (
              <div className="wishlist-modal__section wishlist-modal__links">
                <span className="wishlist-modal__links-label">✈️ Flights</span>
                <a href={google} target="_blank" rel="noopener noreferrer" className="wishlist-modal__link-btn">
                  Google Flights
                </a>
                <a href={skyscanner} target="_blank" rel="noopener noreferrer" className="wishlist-modal__link-btn">
                  Skyscanner
                </a>
                <span className="wishlist-modal__links-divider" />
                <span className="wishlist-modal__links-label">🛂 Visa</span>
                {!auth.passportCountry ? (
                  <span className="wishlist-modal__link-hint">Set passport in profile</span>
                ) : visaLoading ? (
                  <span className="wishlist-modal__visa-loading" />
                ) : visaBadge ? (
                  <span className={`wishlist-modal__visa-badge wishlist-modal__visa-badge--${visaBadge.cls}`}>
                    {visaBadge.label}
                  </span>
                ) : (
                  <span className="wishlist-modal__link-hint">No data</span>
                )}
              </div>
            );
          })()}

          {homeCurrencyCode && destCurrencyCode && homeCurrencyCode !== destCurrencyCode && (
            <div className="wishlist-modal__section wishlist-modal__converter">
              <span className="wishlist-modal__converter-label">💱 Currency</span>
              <div className="wishlist-modal__converter-row">
                <input
                  className="wishlist-modal__converter-input"
                  type="number"
                  min="0"
                  value={converterAmount}
                  onChange={(e) => setConverterAmount(e.target.value)}
                />
                <span className="wishlist-modal__converter-code">{homeCurrencyCode}</span>
                <span className="wishlist-modal__converter-arrow">→</span>
                <span className="wishlist-modal__converter-result">
                  {convertedAmount !== null ? convertedAmount : "—"}
                </span>
                <span className="wishlist-modal__converter-code">{destCurrencyCode}</span>
              </div>
            </div>
          )}

          <div className="wishlist-modal__section">
            <ClimateChart lat={coords?.lat} lon={coords?.lon} />
          </div>

          {canEdit && (
            <div className="wishlist-modal__section wishlist-modal__planning">
              {savedIndicator && (
                <span className="wishlist-modal__saved">Saved ✓</span>
              )}
              <div className="wishlist-modal__fields-row">
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
                    {PRIORITY_OPTIONS.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
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
            </div>
          )}

          <div className="wishlist-modal__section country-modal__notes">
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
