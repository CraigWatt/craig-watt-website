import { Button as StitchesButton } from './components/Button';
import { Button } from '@heroui/button';

export default function App() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 gap-4">
      <StitchesButton>Hello from Stitches</StitchesButton>
      <Button color="primary">Hello from Hero UI</Button>
      <Button color="primary">Click Me</Button>
      <Button variant="ghost" color="secondary">
        Secondary Ghost
      </Button>
      <div className="flex flex-wrap gap-4 items-center">
        <Button color="default">Default</Button>
        <Button color="primary">Primary</Button>
        <Button color="secondary">Secondary</Button>
        <Button color="success">Success</Button>
        <Button color="warning">Warning</Button>
        <Button color="danger">Danger</Button>
      </div>
      <div className="bg-default text-default-foreground p-4 rounded-medium">
        Testing Hero UI Tokens
      </div>
      <div className="bg-blue-500 text-white p-4 rounded">
        ✅ Tailwind is working
      </div>
      <div className="bg-primary text-primary-foreground p-4 rounded-medium">
        Tailwind Token Test
      </div>
    </main>
  );
}
