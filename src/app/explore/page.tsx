// src/app/explore/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import ValueCardClient from "@/components/ValueCardClient";
import LinkCardClient from "@/components/LinkCardClient";
import ListCountClient from "@/components/ListCountClient";
import BarsClient from "@/components/BarsClient";

export default async function ExplorePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <header className="flex items-end justify-between gap-4">
        <h1 className="font-serif text-3xl">Explore</h1>
      </header>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ValueCardClient label="People"          endpoint="/api/explore/basic" path="basic.total_people" />
        <ValueCardClient label="Alive (marked)"  endpoint="/api/explore/basic" path="basic.alive_count" />
        <ValueCardClient label="With DOB"        endpoint="/api/explore/basic" path="basic.with_dob" />
        <ValueCardClient label="With DOD"        endpoint="/api/explore/basic" path="basic.with_dod" />
        <ValueCardClient label="Marriages"       endpoint="/api/explore/basic" path="basic.total_marriages" />
        <LinkCardClient  label="Oldest DOB"      endpoint="/api/explore/basic"
          idPath="oldest.id" givenPath="oldest.givenName" familyPath="oldest.familyName" datePath="oldest.dob" />
        <LinkCardClient  label="Newest DOB"      endpoint="/api/explore/basic"
          idPath="newest.id" givenPath="newest.givenName" familyPath="newest.familyName" datePath="newest.dob" />
        <ValueCardClient label="Generations (max depth)" endpoint="/api/explore/generation-depth" path="depth" />
      </section>

      {/* Parent coverage */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Parent coverage</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <ValueCardClient label="Both parents" endpoint="/api/explore/parent-coverage" path="rows" type="text" />
          <ValueCardClient label="One parent"   endpoint="/api/explore/parent-coverage" path="rows" type="text" />
          <ValueCardClient label="No parents"   endpoint="/api/explore/parent-coverage" path="rows" type="text" />
        </div>
      </section>

      {/* Timeline */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Births per decade</h2>
          <BarsClient endpoint="/api/explore/births-per-decade" />
        </div>
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Deaths per decade</h2>
          <BarsClient endpoint="/api/explore/deaths-per-decade" />
        </div>
      </section>

      {/* Oldest living */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Oldest living (top 10)</h2>
        <ListCountClient
          endpoint="/api/explore/oldest-living"
          labelTemplate="{{dob|date}} — {{givenName}} {{familyName}}"
          linkBase="/person"
          idKey="id"
          // no countKey => hides right column
        />
      </section>

      {/* Names & Countries */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Most common family names</h2>
          <ListCountClient
            endpoint="/api/explore/top-surnames"
            labelTemplate="{{familyName}}"
            linkBase=""        // no person id to link
            idKey="familyName"
            countKey="count"
          />
        </div>
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Top birth countries</h2>
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
        <h2 className="text-base font-semibold mb-4">Where people live now</h2>
        <ListCountClient
          endpoint="/api/explore/living-countries"
          labelTemplate="{{Country}}"  // uses the exact field name returned by the API
          linkBase=""                  // no person link
          idKey="Country"              // key to make list items stable
          countKey="count"             // show counts on the right
        />
      </section>

      {/* Parents with most children */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Parents with the most children</h2>
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
        <h2 className="text-base font-semibold mb-4">Most marriages (top 10)</h2>
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
        <h2 className="text-base font-semibold mb-4">Data quality</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <ValueCardClient label="DoD before DoB"     endpoint="/api/explore/anomalies"       path="map.dod_before_dob" />
          <ValueCardClient label="DOB in future"      endpoint="/api/explore/anomalies"       path="map.dob_in_future" />
          <ValueCardClient label="Missing name"       endpoint="/api/explore/anomalies"       path="map.missing_name" />
          <ValueCardClient label="DOB (Hijri) present" endpoint="/api/explore/hijri-coverage" path="map.dob_hijri" />
          <ValueCardClient label="DOD (Hijri) present" endpoint="/api/explore/hijri-coverage" path="map.dod_hijri" />
        </div>
      </section>
    </main>
  );
}
