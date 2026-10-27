/**
 * First-use instructions. A web app can only work offline after its files
 * have been downloaded once, so students must open it online first.
 */
export function OfflineGuide() {
  return (
    <ol className="list-decimal space-y-2 pl-5 text-ink">
      <li>
        <strong>Open this page once while connected to the internet.</strong> The app saves its lessons, activities and
        pictures on your device. Wait until the top of the screen says <em>Saved for offline use</em>.
      </li>
      <li>
        <strong>Optional: add it to your home screen.</strong> On Android (Chrome), tap the menu and choose{" "}
        <em>Add to Home screen</em> or <em>Install app</em>. On iPhone or iPad (Safari), tap <em>Share</em>, then{" "}
        <em>Add to Home Screen</em>.
      </li>
      <li>
        <strong>Learn without internet.</strong> Next time, open the app from the same browser or home-screen icon. Your
        progress is saved on this device only.
      </li>
      <li>
        <strong>Keep your progress.</strong> Clearing your browser&apos;s data or using private browsing removes saved
        progress.
      </li>
    </ol>
  );
}
