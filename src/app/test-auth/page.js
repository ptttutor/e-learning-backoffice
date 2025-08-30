"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function TestAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (session) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Signed in as {session.user.email}</h1>
        <p>Name: {session.user.name}</p>
        <p>Image: {session.user.image}</p>
        <button onClick={() => signOut()}>Sign out</button>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Not signed in</h1>
      <button onClick={() => signIn("line")}>Sign in with LINE</button>
      <br /><br />
      <button onClick={() => signIn("credentials")}>Sign in with Email</button>
    </div>
  );
}