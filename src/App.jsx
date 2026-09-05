import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "./lib/supabase";

import TopBar
  from "./components/TopBar";

import Landing
  from "./components/Landing";

import Auth
  from "./components/Auth";

import Browse
  from "./components/Browse";

import Detail
  from "./components/Detail";

import OwnerForm
  from "./components/OwnerForm";

export default function App() {

  const [
    screen,
    setScreen,
  ] =
    useState("landing");

  const [
    user,
    setUser,
  ] =
    useState(null);

  const [
    role,
    setRole,
  ] =
    useState(null);

  const [
    listings,
    setListings,
  ] =
    useState([]);

  const [
    selectedListing,
    setSelectedListing,
  ] =
    useState(null);

  async function loadListings() {

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "pg_listings"
        )
        .select(`
          *,
          pg_sharing_options(*),
          pg_images(*)
        `)
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

    if (error) {

      console.error(
        error
      );

      return;

    }

    setListings(
      data || []
    );
  }

  useEffect(() => {

    loadListings();

  }, []);

  function selectRole(
    selectedRole
  ) {

    setRole(
      selectedRole
    );

    setScreen(
      "auth"
    );
  }

  function handleLogin(
    profile
  ) {

    setUser(
      profile
    );

    setRole(
      profile.role
    );

    if (
      profile.role ===
      "owner"
    ) {

      setScreen(
        "owner"
      );

    } else {

      setScreen(
        "browse"
      );

    }
  }

  function openListing(
    id
  ) {

    const listing =
      listings.find(
        (item) =>
          item.id === id
      );

    setSelectedListing(
      listing
    );

    setScreen(
      "detail"
    );
  }

  async function logout() {

    await supabase.auth
      .signOut();

    setUser(null);

    setRole(null);

    setScreen(
      "landing"
    );
  }

  function goHome() {

    if (
      role === "seeker"
    ) {

      setScreen(
        "browse"
      );

    } else if (
      role === "owner"
    ) {

      setScreen(
        "owner"
      );

    } else {

      setScreen(
        "landing"
      );

    }
  }

  return (
    <div className="app">

      <TopBar
        user={user}
        role={role}
        onHome={goHome}
        onLogout={logout}
      />

      {screen ===
        "landing" && (

        <Landing
          onSelectRole={
            selectRole
          }
        />

      )}

      {screen ===
        "auth" && (

        <Auth
          role={role}
          onSuccess={
            handleLogin
          }
        />

      )}

      {screen ===
        "browse" && (

        <Browse
          listings={
            listings
          }
          onOpen={
            openListing
          }
        />

      )}

      {screen ===
        "detail" &&
        selectedListing && (

        <Detail
          listing={
            selectedListing
          }
          user={user}
          onBack={() =>
            setScreen(
              "browse"
            )
          }
        />

      )}

      {screen ===
        "owner" && (

        <OwnerForm
          owner={user}
          onSuccess={async () => {

            await loadListings();

            alert(
              "PG listed successfully!"
            );

            setScreen(
              "owner"
            );

          }}
        />

      )}

    </div>
  );
}