import { ThemeSwitcher } from './components/ThemeSwitcher';
// import { Button as StitchesButton } from './components/Button';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { User } from '@heroui/user';

export default function App() {
  return (
    <main className="space-y-20">
      {/* 1) Hero Section */}
      <section className="text-center py-20 px-6">
        <ThemeSwitcher className="absolute top-4 right-4" />
        <h1 className="text-5xl font-bold mb-4">Hi—I’m Craig Watt.</h1>
        <p className="text-lg mb-8 text-zinc-600 dark:text-zinc-300">
          I build web things, write about code, and love a good challenge.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/cv" passHref>
            <Button as="a" variant="solid">
              View My CV
            </Button>
          </Link>
          <Link href="/projects" passHref>
            <Button as="a" variant="bordered">
              See Projects
            </Button>
          </Link>
        </div>
      </section>

      {/* 2) About / Profile */}
      <section className="bg-default/5 dark:bg-default/20 py-20">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <User
            name="Craig Watt"
            description="Full-stack Engineer & Blogger"
            avatarProps={{ src: '/images/avatar.jpg', alt: 'Craig’s avatar' }}
          />
          <p className="text-base leading-relaxed">
            A quick “about me” blurb goes here—your background, passions, and
            what drives you.
          </p>
        </div>
      </section>

      {/* 3) Featured Projects */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-semibold text-center mb-8">
          Featured Projects
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Replace these placeholders with real data */}
          {[
            {
              title: 'Project A',
              href: '/projects/a',
              description: 'Short description.',
            },
            {
              title: 'Project B',
              href: '/projects/b',
              description: 'Short description.',
            },
            {
              title: 'Project C',
              href: '/projects/c',
              description: 'Short description.',
            },
          ].map((p) => (
            <article
              key={p.href}
              className="border rounded p-4 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-medium mb-2">{p.title}</h3>
              <p className="text-sm mb-4">{p.description}</p>
              <Link href={p.href} passHref>
                <Button as="a" size="sm" variant="light">
                  View Project
                </Button>
              </Link>
            </article>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/projects" passHref>
            <Button as="a" variant="ghost">
              See All Projects
            </Button>
          </Link>
        </div>
      </section>

      {/* 4) Blog Teaser (optional) */}
      <section className="py-20 px-6 bg-default/5 dark:bg-default/20">
        <h2 className="text-3xl font-semibold text-center mb-8">
          From the Blog
        </h2>
        {/* you can list 2–3 recent posts here */}
      </section>
    </main>
  );
}
