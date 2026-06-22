"use client";

import { useSettingsEditor } from "@/lib/settings/use-settings-editor";
import { SettingsField, SettingsInput, SettingsSelect } from "@/components/settings/SettingsField";
import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import type { DepositDefaultMode } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

export function DefaultsTab() {
  const { settings, updateDefaults } = useSettingsEditor();
  const { defaults } = settings;

  function setDepositMode(mode: DepositDefaultMode) {
    if (mode === defaults.depositMode) return;
    updateDefaults({
      depositMode: mode,
      depositValue: mode === "fixed" ? 100 : 25,
    });
  }

  return (
    <div className="space-y-6">
      <SetupAccordion title="Sales & quoting">
        <div className="grid gap-5 sm:grid-cols-2">
          <SettingsField label="Default pricing type">
            <SettingsSelect
              value={defaults.defaultPricingType}
              onChange={(e) =>
                updateDefaults({
                  defaultPricingType: e.target.value as "hourly" | "flat_rate",
                })
              }
            >
              <option value="flat_rate">Flat rate</option>
              <option value="hourly">Hourly</option>
            </SettingsSelect>
          </SettingsField>

          <SettingsField
            label="Default deposit"
            hint={
              defaults.depositMode === "fixed"
                ? "Flat dollar amount suggested on new quotes."
                : "Percentage of quote total suggested on new quotes."
            }
            className="sm:col-span-2"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setDepositMode("fixed")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    defaults.depositMode === "fixed"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Dollar amount
                </button>
                <button
                  type="button"
                  onClick={() => setDepositMode("percent")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    defaults.depositMode === "percent"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Percent
                </button>
              </div>
              <div className="relative min-w-0 flex-1 sm:max-w-[12rem]">
                {defaults.depositMode === "fixed" ? (
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    $
                  </span>
                ) : null}
                <SettingsInput
                  type="number"
                  min={0}
                  max={defaults.depositMode === "percent" ? 100 : undefined}
                  step={defaults.depositMode === "fixed" ? 1 : 1}
                  className={defaults.depositMode === "fixed" ? "pl-7" : "pr-8"}
                  value={defaults.depositValue}
                  onChange={(e) =>
                    updateDefaults({ depositValue: Number(e.target.value) || 0 })
                  }
                />
                {defaults.depositMode === "percent" ? (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    %
                  </span>
                ) : null}
              </div>
            </div>
          </SettingsField>

          <SettingsField label="Quote validity (days)" className="sm:col-span-2">
            <SettingsInput
              type="number"
              min={1}
              max={90}
              value={defaults.quoteValidityDays}
              onChange={(e) => updateDefaults({ quoteValidityDays: Number(e.target.value) })}
            />
          </SettingsField>

          <SettingsField
            label="Flat-rate inventory basis"
            hint="AI flat-rate quotes and move inventory display use cubic feet or weight."
          >
            <SettingsSelect
              value={defaults.flatRateInventoryBasis}
              onChange={(e) =>
                updateDefaults({
                  flatRateInventoryBasis: e.target.value as "cubic_feet" | "weight",
                })
              }
            >
              <option value="cubic_feet">Cubic feet</option>
              <option value="weight">Weight (lbs)</option>
            </SettingsSelect>
          </SettingsField>

          <SettingsField
            label="Hourly not-to-exceed (NTE)"
            hint="Maximum invoice ceiling shown on hourly quotes and contracts."
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                $
              </span>
              <SettingsInput
                type="number"
                min={0}
                step={100}
                className="pl-7"
                value={defaults.hourlyNotToExceedAmount}
                onChange={(e) =>
                  updateDefaults({ hourlyNotToExceedAmount: Number(e.target.value) || 0 })
                }
              />
            </div>
          </SettingsField>
        </div>
      </SetupAccordion>

      <SetupAccordion title="Scheduling & dispatch">
        <div className="grid gap-5 sm:grid-cols-2">
          <SettingsField
            label="Default crew departure"
            hint="Shop/yard departure time applied to new job days. Crew sees this on dispatch."
            className="sm:max-w-xs"
          >
            <SettingsInput
              type="time"
              value={defaults.defaultCrewDepartureTime}
              onChange={(e) =>
                updateDefaults({ defaultCrewDepartureTime: e.target.value || "07:15" })
              }
            />
          </SettingsField>

          <SettingsField
            label="Customer arrival window"
            hint="Length of the morning first-job arrival window shown to customers."
            className="sm:max-w-xs"
          >
            <SettingsSelect
              value={String(defaults.defaultCustomerArrivalWindowMinutes)}
              onChange={(e) =>
                updateDefaults({
                  defaultCustomerArrivalWindowMinutes: Number(e.target.value) as 30 | 45 | 60,
                })
              }
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
            </SettingsSelect>
          </SettingsField>

          <SettingsField
            label="Depot → job drive estimate"
            hint="Fallback minutes from shop to first stop until Google Maps drive time is connected."
            className="sm:max-w-xs"
          >
            <SettingsInput
              type="number"
              min={10}
              max={180}
              step={5}
              value={defaults.defaultDepotToJobDriveMinutes}
              onChange={(e) =>
                updateDefaults({
                  defaultDepotToJobDriveMinutes: Number(e.target.value) || 45,
                })
              }
            />
          </SettingsField>

          <SettingsField
            label="Follow-on job arrival window"
            hint="Flexible customer arrival window when the crew is already on the road. Used on the calendar and job day editor."
            className="sm:col-span-2"
          >
            <div className="flex max-w-md flex-wrap items-center gap-2">
              <SettingsInput
                type="time"
                value={defaults.defaultFollowOnArrivalStartTime}
                onChange={(e) =>
                  updateDefaults({
                    defaultFollowOnArrivalStartTime: e.target.value || "11:00",
                  })
                }
                className="min-w-0 flex-1"
              />
              <span className="text-sm text-slate-500">to</span>
              <SettingsInput
                type="time"
                value={defaults.defaultFollowOnArrivalEndTime}
                onChange={(e) =>
                  updateDefaults({
                    defaultFollowOnArrivalEndTime: e.target.value || "16:00",
                  })
                }
                className="min-w-0 flex-1"
              />
            </div>
          </SettingsField>
        </div>
      </SetupAccordion>

      <SetupAccordion title="Post-move reviews">
        <div className="grid gap-5 sm:grid-cols-2">
          <SettingsField
            label="Google review after crew rating"
            hint="Customers rate crew on the feedback portal first. At or above this score, they see your Google review link. All ratings notify ops."
            className="sm:max-w-md"
          >
            <SettingsSelect
              value={String(defaults.postMoveGoogleReviewMinStars)}
              onChange={(e) =>
                updateDefaults({
                  postMoveGoogleReviewMinStars: Number(e.target.value) as 3 | 4 | 5,
                })
              }
            >
              <option value="5">5 stars only (default)</option>
              <option value="4">4 stars and up</option>
              <option value="3">3 stars and up</option>
            </SettingsSelect>
          </SettingsField>
          <p className="text-xs leading-relaxed text-slate-500 sm:col-span-2">
            Post-move automations use{" "}
            <code className="rounded bg-slate-100 px-1 text-[11px]">{"{{feedbackLink}}"}</code>{" "}
            — the customer&apos;s move portal, not the Google link directly. Set the Google URL per
            branch under Admin → Company → Locations.{" "}
            <a
              href="/portal/move?move=mv-complete"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-600 hover:underline"
            >
              Preview on a completed move
            </a>
          </p>
        </div>
      </SetupAccordion>
    </div>
  );
}
