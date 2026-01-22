'use client';

export default function TestPage() {
  const [clickCount, setClickCount] = React.useState(0);
  
  return (
    <div>
      <h1>JavaScript Test</h1>
      <button onClick={() => setClickCount(clickCount + 1)}>
        Click me: {clickCount}
      </button>
      <p>If the number increases when clicked, JavaScript works.</p>
    </div>
  );
}
