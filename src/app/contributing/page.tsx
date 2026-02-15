"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  GitPullRequest, 
  FileJson, 
  Globe, 
  BookOpen, 
  Github, 
  MessageSquare 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function ContributingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container py-12 md:py-24">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-4xl"
      >
        <motion.div variants={item} className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Contributing to LocaleDB
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            LocaleDB is an open-source project and we love contributions from developers worldwide!
          </p>
        </motion.div>

        {/* Contribution Type Cards */}
        <motion.section variants={item} className="grid md:grid-cols-3 gap-6 mb-20">
            {[
                {
                    title: "Fix Data",
                    icon: FileJson,
                    desc: "Correct typos or update outdated locale information.",
                    color: "text-blue-500",
                    bg: "bg-blue-500/10"
                },
                {
                    title: "Add Country",
                    icon: Globe,
                    desc: "Add missing countries using standard codes.",
                    color: "text-green-500",
                    bg: "bg-green-500/10"
                },
                {
                    title: "Improve Code",
                    icon:  GitPullRequest,
                    desc: "Enhance the UI, search, or build scripts.",
                    color: "text-purple-500",
                    bg: "bg-purple-500/10"
                }
            ].map((card, i) => (
                <div key={i} className="p-6 rounded-xl border bg-card hover:shadow-lg transition-all">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${card.bg}`}>
                        <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                </div>
            ))}
        </motion.section>

        {/* Workflow Steps */}
        <motion.section variants={item} className="mb-20">
           <h2 className="text-2xl font-bold mb-10 text-center">Data Contribution Workflow</h2>
           
           <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 md:before:ml-8 before:-translate-x-px before:h-full before:w-0.5 before:bg-border before:z-0">
               {/* Step 1 */}
               <div className="relative pl-16 md:pl-24">
                   <div className="absolute left-0 md:left-2 top-0 flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-blue-500 text-white font-bold z-10">
                       1
                   </div>
                   <h3 className="text-xl font-bold mb-2">Fork & Setup</h3>
                   <p className="text-muted-foreground mb-4">
                       Fork the <Link href={siteConfig.links.github} target="_blank" className="text-foreground hover:underline">GitHub repository</Link> and clone it to your local machine.
                   </p>
               </div>

               {/* Step 2 */}
               <div className="relative pl-16 md:pl-24">
                   <div className="absolute left-0 md:left-2 top-0 flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-blue-500 text-white font-bold z-10">
                       2
                   </div>
                   <h3 className="text-xl font-bold mb-2">Use Data Overrides</h3>
                   <p className="text-muted-foreground mb-4">
                       To fix data, <strong>do not edit</strong> the generated files in <code>/data/countries/</code>. 
                       Instead, create or edit a file in <code>/data/overrides/XX.json</code> (where XX is the country code).
                   </p>
                   <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 shadow-inner overflow-x-auto">
<pre className="text-xs md:text-sm text-zinc-300 font-mono">
{`// data/overrides/TR.json
{
  "currency": {
    "symbolPosition": "before"
  }
}`}
</pre>
                   </div>
               </div>

               {/* Step 3 */}
               <div className="relative pl-16 md:pl-24">
                   <div className="absolute left-0 md:left-2 top-0 flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-blue-500 text-white font-bold z-10">
                       3
                   </div>
                   <h3 className="text-xl font-bold mb-2">Verify & Submit</h3>
                   <p className="text-muted-foreground mb-4">
                       Run the build script to verify your changes are merged correctly. Then submit a Pull Request with references to official sources.
                   </p>
                   <div className="flex gap-2">
                       <code className="px-2 py-1 rounded bg-muted">npm run build:data</code>
                   </div>
               </div>
           </div>
        </motion.section>

        {/* Guidelines Grid */}
        <motion.section variants={item} className="mb-20">
             <h2 className="text-2xl font-bold mb-8">Guidelines</h2>
             <div className="grid md:grid-cols-2 gap-6">
                 <div className="p-6 rounded-xl border bg-muted/30">
                     <h3 className="font-semibold mb-4 flex items-center">
                         <GitPullRequest className="w-5 h-5 mr-2" />
                         Pull Requests
                     </h3>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                         <li className="flex items-center">• One change per PR</li>
                         <li className="flex items-center">• Clear, descriptive commit messages</li>
                         <li className="flex items-center">• Link to official sources (CLDR, Gov sites)</li>
                     </ul>
                 </div>
                 <div className="p-6 rounded-xl border bg-muted/30">
                     <h3 className="font-semibold mb-4 flex items-center">
                         <BookOpen className="w-5 h-5 mr-2" />
                         Resources
                     </h3>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                         <li className="flex items-center">• <Link href="https://cldr.unicode.org/" target="_blank" className="hover:underline">CLDR Repository</Link></li>
                         <li className="flex items-center">• <Link href="https://github.com/mledoze/countries" target="_blank" className="hover:underline">mledoze/countries</Link></li>
                         <li className="flex items-center">• ISO 3166 Standards</li>
                     </ul>
                 </div>
             </div>
        </motion.section>

        {/* Help CTA */}
        <motion.section variants={item} className="text-center bg-card border rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
             <p className="text-muted-foreground mb-8">
                 Have a question or stuck on a step? Start a discussion on GitHub.
             </p>
             <Button variant="outline" size="lg" asChild>
                 <Link href={`${siteConfig.links.github}/discussions`} target="_blank">
                     <MessageSquare className="mr-2 h-5 w-5" />
                     Join Discussion
                 </Link>
             </Button>
        </motion.section>

      </motion.div>
    </div>
  );
}
