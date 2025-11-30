import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FaGithub, FaTwitter, FaLinkedin, FaDribbble } from "react-icons/fa";
import { HiMail, HiQuestionMarkCircle } from "react-icons/hi";

// Team members list with additional details
const teamMembers = [
  {
    name: "Hanzala",
    role: "Student",
    avatar: "https://avatar.iran.liara.run/public/41",
    socials: [
      {
        platform: "GitHub",
        url: "https://github.com/Hanzlah24",
        icon: <FaGithub size={18} />,
      },
      {
        platform: "LinkedIn",
        url: "https://www.linkedin.com/in/muhammad-hanzala-6a5053317?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app ",
        icon: <FaLinkedin size={18} />,
      },
      {
        platform: "Email",
        url: "mailto:hanzlah2244@gmail.com",
        icon: <HiMail size={18} />,
      },
    ],
  },
  {
    name: "Ahsan Rana",
    role: "Student",
    avatar: "https://avatar.iran.liara.run/public/38",
    socials: [
      {
        platform: "GitHub",
        url: "https://github.com/ewjinx",
        icon: <FaGithub size={18} />,
      },
      {
        platform: "LinkedIn",
        url: "https://www.linkedin.com/in/ahsan-rana-8b481a251?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app ",
        icon: <FaLinkedin size={18} />,
      },
      {
        platform: "Email",
        url: "mailto:ranaoverhere@gmail.com",
        icon: <HiMail size={18} />,
      },
    ],
  },
  {
    name: "Laiba Zafar",
    role: "Student",
    avatar: "https://avatar.iran.liara.run/public/73",
    socials: [
      {
        platform: "GitHub",
        url: "https://github.com/lz023",
        icon: <FaGithub size={18} />,
      },
      {
        platform: "LinkedIn",
        url: "https://www.linkedin.com/in/laiba-zafar-68b862306?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app ",
        icon: <FaLinkedin size={18} />,
      },
      {
        platform: "Email",
        url: "mailto:laibazfr23@gmail.com",
        icon: <HiMail size={18} />,
      },
    ],
  },
  {
    name: "Ahmed",
    role: "Student",
    avatar: "https://avatar.iran.liara.run/public/47",
    socials: [
      {
        platform: "GitHub",
        url: "https://github.com/ahmed-javed",
        icon: <FaGithub size={18} />,
      },
      {
        platform: "LinkedIn",
        url: "https://www.linkedin.com/in/ahmed-javed-510904202",
        icon: <FaLinkedin size={18} />,
      },
      {
        platform: "Email",
        url: "mailto:ahmedjaved12.aj@gmail.com",
        icon: <HiMail size={18} />,
      },
    ],
  },
  {
    name: "Asma Zahid",
    role: "Student",
    avatar: "https://avatar.iran.liara.run/public/97",
    socials: [
      {
        platform: "GitHub",
        url: "https://github.com/asmazahid",
        icon: <FaGithub size={18} />,
      },
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/asmazahid",
        icon: <FaLinkedin size={18} />,
      },
      {
        platform: "Email",
        url: "mailto:asmazahid@example.com",
        icon: <HiMail size={18} />,
      },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const HelpPage: React.FC = () => {
  useEffect(() => {
    document.title = "Help | Our Project";
  }, []);

  return (
    <MainLayout title="About">
      <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-4">
            About Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the team behind this project. We're passionate about
            creating amazing experiences.
          </p>
        </motion.div>

        <div className="w-full max-w-6xl">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6 flex flex-col items-center">
                  <div className="relative mb-4">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 dark:border-gray-700"
                    />
                    {/* <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {member.role}
                    </div> */}
                  </div>

                  <h2 className="text-xl font-bold text-center mb-1">
                    {member.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {member.role}
                  </p>

                  <div className="flex space-x-3">
                    {member.socials.map((s) => (
                      <a
                        key={s.platform}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-400 transition-colors"
                        aria-label={`${member.name}'s ${s.platform}`}
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center">
                <HiQuestionMarkCircle className="mr-2 text-purple-600" />{" "}
                Documentation
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Check out our comprehensive guides and tutorials.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/docs">View Docs</Link>
              </Button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center">
                <HiMail className="mr-2 text-purple-600" /> Contact Support
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Can't find what you need? Our team is here to help.
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                asChild
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </motion.div> */}
      </div>
    </MainLayout>
  );
};

export default HelpPage;
