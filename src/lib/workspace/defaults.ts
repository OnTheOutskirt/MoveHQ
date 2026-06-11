import {
  DEFAULT_COMPANY_ID,
  DEFAULT_PRIMARY_GOOGLE_REVIEW_URL,
  DEFAULT_PRIMARY_LOCATION_ID,
} from "./constants";
import { mergeLocationWithDefaults } from "./location-profile";
import { defaultWorkspaceCalendarConfig } from "@/lib/calendar/metrics/defaults";
import type { WorkspaceConfig } from "./types";

export function defaultWorkspaceConfig(): WorkspaceConfig {
  return {
    company: {
      id: DEFAULT_COMPANY_ID,
      name: "Jonah's Movers",
      legalName: "Jonah's Movers LLC",
      website: "https://jonahsmovers.com",
    },
    locations: [
      mergeLocationWithDefaults(
        {
          id: DEFAULT_PRIMARY_LOCATION_ID,
          companyId: DEFAULT_COMPANY_ID,
          name: "Tomball",
          shortName: "TMB",
          status: "active",
          isPrimary: true,
          addressLine1: "13219 Theis Ln, Ste A",
          city: "Tomball",
          state: "TX",
          zip: "77375",
          timezone: "America/Chicago",
          phone: "(832) 728-6675",
          email: "Info@jonahsmovers.com",
          website: "https://jonahsmovers.com",
          googleReviewUrl: DEFAULT_PRIMARY_GOOGLE_REVIEW_URL,
          quoteReferencePrefix: "JM",
          serviceAreaNotes: "",
          officeHoursStart: "08:00",
          officeHoursEnd: "17:00",
        },
        DEFAULT_COMPANY_ID,
      ),
    ],
    calendar: defaultWorkspaceCalendarConfig(),
  };
}
