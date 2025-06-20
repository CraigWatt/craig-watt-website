// import { Button as StitchesButton } from './components/Button';
import projects from './config/projects';
import { ProjectCard } from './components/ProjectCard';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { User } from '@heroui/user';

export default function App() {
  return (
    <main className="space-y-20">
      {/* 1) Hero Section */}
      <section className="relative text-center py-32 px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold mb-6">Hi, I’m Craig Watt.</h1>
          <p className="text-lg mb-6 text-zinc-600 dark:text-zinc-300">
            Observability Engineer by day—crafting monitoring with Grafana,
            Telegraf, and CI/CD—aspiring SRE who enjoys writing about code and
            tackling hard challenges.
          </p>
        </div>
        <div className="flex justify-center gap-6">
          <Button as="a" href="/cv" variant="solid">
            View My CV
          </Button>
          <Button as="a" href="/projects" variant="bordered">
            See Projects
          </Button>
        </div>
      </section>

      {/* 2) About / Profile */}
      <section className="bg-default/5 dark:bg-default/20 py-16 px-4 md:px-6">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <User
            name="Craig Watt"
            description="Observability Engineer"
            avatarProps={{ src: '/images/avatar.jpg', alt: 'Craig’s avatar' }}
          />
          <p className="text-base leading-relaxed">
            I’m an Observability Engineer at Sky, building and maintaining
            scalable media-asset management systems. I specialize in real-time
            monitoring and automation with Grafana, Telegraf, Docker, and
            Kubernetes. When I’m not tuning pipelines or writing back-end
            services in C and Python, you’ll find me setting up a Raspberry Pi
            k3s cluster, writing code, and tackling complex challenges head-on.
          </p>
        </div>
      </section>

      {/* 3) Featured Projects using same ProjectCard */}
      <section className="py-16 px-4 md:px-6">
        <h2 className="text-3xl font-semibold text-center mb-8">
          Featured Projects
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {projects.slice(0, 3).map((p) => (
            <ProjectCard
              key={p.slug}
              title={p.title}
              href={`/projects/${p.slug}`}
              description={p.description}
              image={p.thumb} // use thumb (16:9); ensure your config.projects uses thumb paths
            />
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

      {/* 4) Blog Teaser */}
      <section className="py-16 px-4 md:px-6 bg-default/5 dark:bg-default/20">
        <h2 className="text-3xl font-semibold text-center mb-8">
          From the Blog
        </h2>
        {/* list 2–3 BlogCard components similarly, using a different BlogCard */}
      </section>
    </main>
  );
}
