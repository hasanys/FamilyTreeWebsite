// src/app/explore/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import ValueCardClient from "@/components/ValueCardClient";
import LinkCardClient from "@/components/LinkCardClient";
import ListCountClient from "@/components/ListCountClient";
import BarsClient from "@/components/BarsClient";
import Tooltip from "@/components/Tooltip";

export default async function ExplorePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <header className="flex items-end justify-between gap-4">
        <h1 className="font-serif text-3xl">Explore</h1>
      </header>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <div className="text-sm text-gray-600">
            People
            <Tooltip text="Total number of individuals in the family tree database">
              <span>ⓘ</span>
            </Tooltip>
          </div>
          <ValueCardClient label="" endpoint="/api/explore/basic" path="basic.total_people" />
        </div>

        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <div className="text-sm text-gray-600">
            Alive (marked)
            <Tooltip text="Number of people explicitly marked as currently living in the database">
              <span>ⓘ</span>
            </Tooltip>
          </div>
          <ValueCardClient label="" endpoint="/api/explore/basic" path="basic.alive_count" />
        </div>

        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <div className="text-sm text-gray-600">
            With DOB
            <Tooltip text="Number of people with a recorded date of birth">
              <span>ⓘ</span>
            </Tooltip>
          </div>
          <ValueCardClient label="" endpoint="/api/explore/basic" path="basic.with_dob" />
        </div>

        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <div className="text-sm text-gray-600">
            With DOD
            <Tooltip text="Number of people with a recorded date of death">
              <span>ⓘ</span>
            </Tooltip>
          </div>
          <ValueCardClient label="" endpoint="/api/explore/basic" path="basic.with_dod" />
        </div>

        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <div className="text-sm text-gray-600">
            Marriages
            <Tooltip text="Total number of recorded marriages in the family tree">
              <span>ⓘ</span>
            </Tooltip>
          </div>
          <ValueCardClient label="" endpoint="/api/explore/basic" path="basic.total_marriages" />
        </div>

        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <div className="text-sm text-gray-600">
            Oldest DOB
            <Tooltip text="Person with the earliest recorded date of birth">
              <span>ⓘ</span>
            </Tooltip>
          </div>
          <LinkCardClient label="" endpoint="/api/explore/basic"
            idPath="oldest.id" givenPath="oldest.givenName" familyPath="oldest.familyName" datePath="oldest.dob" />
        </div>

        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <div className="text-sm text-gray-600">
            Newest DOB
            <Tooltip text="Person with the most recent recorded date of birth">
              <span>ⓘ</span>
            </Tooltip>
          </div>
          <LinkCardClient label="" endpoint="/api/explore/basic"
            idPath="newest.id" givenPath="newest.givenName" familyPath="newest.familyName" datePath="newest.dob" />
        </div>

        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <div className="text-sm text-gray-600">
            Generations (max depth)
            <Tooltip text="Maximum number of generations traced in any family line">
              <span>ⓘ</span>
            </Tooltip>
          </div>
          <ValueCardClient label="" endpoint="/api/explore/generation-depth" path="depth" />
        </div>
      </section>

      {/* Parent coverage */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">
          Parent coverage
          <Tooltip text="Shows how many people have both parents recorded, one parent, or no parents in the database">
            <span>ⓘ</span>
          </Tooltip>
        </h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <ValueCardClient label="Both parents" endpoint="/api/explore/parent-coverage" path="rows" type="text" />
          <ValueCardClient label="One parent" endpoint="/api/explore/parent-coverage" path="rows" type="text" />
          <ValueCardClient label="No parents" endpoint="/api/explore/parent-coverage" path="rows" type="text" />
        </div>
      </section>

      {/* Timeline */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">
            Births per decade
            <Tooltip text="Distribution of births across different decades">
              <span>ⓘ</span>
            </Tooltip>
          </h2>
          <BarsClient endpoint="/api/explore/births-per-decade" />
        </div>
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">
            Deaths per decade
            <Tooltip text="Distribution of deaths across different decades">
              <span>ⓘ</span>
            </Tooltip>
          </h2>
          <BarsClient endpoint="/api/explore/deaths-per-decade" />
        </div>
      </section>

      {/* Names & Countries */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">
            Most common family names
            <Tooltip text="Top 10 most frequently occurring surnames in the family tree">
              <span>ⓘ</span>
            </Tooltip>
          </h2>
          <ListCountClient
            endpoint="/api/explore/top-surnames"
            labelTemplate="{{familyName}}"
            linkBase=""
            idKey="familyName"
            countKey="count"
          />
        </div>
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">
            Top birth countries
            <Tooltip text="Countries where the most family members were born">
              <span>ⓘ</span>
            </Tooltip>
          </h2>
          <ListCountClient
            endpoint="/api/explore/top-countries"
            labelTemplate="{{country}}"
            linkBase=""
            idKey="country"
            countKey="count"
          />
        </div>
      </section>

      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">
          Where people live now
          <Tooltip text="Current countries of residence for living family members">
            <span>ⓘ</span>
          </Tooltip>
        </h2>
        <ListCountClient
          endpoint="/api/explore/living-countries"
          labelTemplate="{{Country}}"
          linkBase=""
          idKey="Country"
          countKey="count"
        />
      </section>

      {/* Parents with most children */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">
          Parents with the most children
          <Tooltip text="Top 10 individuals with the highest number of recorded children">
            <span>ⓘ</span>
          </Tooltip>
        </h2>
        <ListCountClient
          endpoint="/api/explore/top-parents"
          labelTemplate="{{givenName}} {{familyName}}"
          linkBase="/person"
          idKey="id"
          countKey="count"
        />
      </section>

      {/* Most marriages */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">
          Most marriages (top 10)
          <Tooltip text="Individuals who have been married the most times">
            <span>ⓘ</span>
          </Tooltip>
        </h2>
        <ListCountClient
          endpoint="/api/explore/most-married"
          labelTemplate="{{givenName}} {{familyName}}"
          linkBase="/person"
          idKey="id"
          countKey="count"
        />
      </section>

      {/* Data quality */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">
          Data quality
          <Tooltip text="Identifies potential data entry errors or inconsistencies in the database (mostly for internal use)">
            <span>ⓘ</span>
          </Tooltip>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <ValueCardClient label="DoD before DoB" endpoint="/api/explore/anomalies" path="map.dod_before_dob" />
          <ValueCardClient label="DOB in future" endpoint="/api/explore/anomalies" path="map.dob_in_future" />
          <ValueCardClient label="Missing name" endpoint="/api/explore/anomalies" path="map.missing_name" />
        </div>
      </section>
    </main>
  );
}