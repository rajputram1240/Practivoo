'use client';
import { ArrowRightCircle } from 'lucide-react';
import Image from 'next/image';


import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

 function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Why embed Practivoo into your school's learning toolkit?",
      answer: "Because it saves teachers time, provides measurable insights into student performance, and keeps learners engaged through interactive, self-correcting exercises that reinforce classroom teaching."
    },
    {
      question: "Why is Practivoo innovative?",
      answer: "We believe quality education should be accessible to everyone. Our freemium model allows students and teachers to experience core features at no cost, while premium options unlock advanced tools for those who need them."
    },
    {
      question: "What are the benefits for students?",
      answer: "Students get instant feedback, personalized learning paths, and engaging exercises that make studying fun. They can practice at their own pace and track their improvement over time."
    },
    {
      question: "How to use Practivoo?",
      answer: "Simply sign up, create your profile, and start exploring! Teachers can create assignments, students can access exercises, and parents can monitor progress—all from one intuitive platform."
    }
  ];

  const toggleAccordion = (index: any) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id='faq-section' className='px-6 md:px-10 py-20'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-3xl md:text-5xl font-extrabold text-center mb-16 text-gray-800'>FAQs</h2>

        <div className='space-y-4'>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl'
            >
              <button
                onClick={() => toggleAccordion(index)}
                className='w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none'
              >
                <div className='flex items-start gap-4 flex-1'>
                  <div className='w-6 h-6 border-2 border-[#0042D2] rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <div className='w-2 h-2 bg-[#0042D2] rounded-full'></div>
                  </div>
                  <h3 className='text-xl md:text-xl font-bold text-gray-800 pr-4'>
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-[#0042D2] transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''
                    }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className='px-6 md:px-8 pb-6 md:pb-8 pl-16 md:pl-20'>
                  <p className='text-lg text-gray-600 leading-relaxed'>
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className='bg-blue-100 w-full min-h-screen'>
      {/* Header & Nav */}
      <header className='bg-white shadow-sm sticky top-0 z-50'>
        <nav className=' mx-10  flex justify-between items-center p-5 px-6 md:px-10'>
          <div className='flex gap-3 items-center'>
            <Image
              src="/Practivoo_Logo.png"
              alt="Practivoo Logo"
              width={40}
              height={40}
              className='w-8 h-8 bg-[#0042D2] md:w-10 md:h-10'
            />
            <h1 className='text-xl md:text-2xl font-bold text-gray-800'>Practivoo</h1>
          </div>
          <div className='flex gap-4 md:gap-6 items-center'>
            <button className='hidden md:block hover:text-[#0042D2] font-medium transition-colors'>Home</button>
            <button className='hidden md:block hover:text-[#0042D2] font-medium transition-colors'>About Us</button>
            <button className='flex items-center gap-2 bg-[#0042D2] text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-md'>
              <span className='text-sm md:text-base'>Contact Us</span>
              <ArrowRightCircle size={20} />
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className='relative  mx-10  px-6 md:px-10 py-16 md:py-24'>
        <Image className="absolute left-0 top-10 " src="/Ellipse3.png" alt="" width={120} height={120} />
        <Image className="absolute right-0 top-0 " src="/Ellipse2.png" alt="" width={120} height={120} />

        <div className='relative text-center z-10'>
          <h2 className='text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight'>
            <span className='text-[#0042D2]'>Practice</span> Today
          </h2>
          <h2 className='text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mt-2'>
            Progress <span className='text-[#0042D2]'>Tomorrow</span>
          </h2>

          <div className='flex flex-col sm:flex-row justify-center items-center gap-4 mt-12'>
            <Image
              src="/googleplay.png"
              alt="Get it on Google Play"
              width={160}
              height={60}
              className='hover:scale-105 transition-transform cursor-pointer'
            />
            <Image
              src="/appstore.png"
              alt="Download on App Store"
              width={160}
              height={60}
              className='hover:scale-105 transition-transform cursor-pointer'
            />
          </div>
        </div>

        <Image className="absolute left-0 bottom-0" src="/Ellipse1.png" alt="" width={120} height={120} />
        <Image className="absolute right-0 bottom-0" src="/Rectangle1.png" alt="" width={150} height={150} />
      </section>

      {/* Features Grid */}
      <section className=' mx-10 mt-10'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 bg-white  md:p-5 rounded-3xl'>
          <div className='rounded-2xl text-center p-6 bg-gradient-to-br from-blue-400 to-blue-500 text-white'>
            <h3 className='text-xl font-bold mb-4'>Track Personal<br />Learning Process</h3>
            <img className="w-full max-w-[200px] mx-auto" src="/g1f1.svg" alt="Learning tracking illustration" />
          </div>

          <div className='flex items-center justify-center p-4'>
            <img className="w-full h-96 object-contain" src="/screens.svg" alt="App screens preview" />
          </div>

          <div className='rounded-2xl text-center p-6 bg-gradient-to-br from-blue-400 to-blue-500 text-white'>
            <h3 className='text-xl font-bold mb-3'>Complete Tasks in<br />Just One Tap</h3>
            <p className='text-sm mb-4 leading-relaxed'>
              Our system is designed to let users finish their tasks in easy and minimum steps.
            </p>
            <img className="w-full max-w-[200px] mx-auto" src="/g1f1.svg" alt="Task completion illustration" />
          </div>
        </div>
      </section>

      {/* School Dashboard Section */}
      <section className=' mx-10 mt-10'>
        <h2 className='text-3xl md:text-5xl font-extrabold text-center mb-12 text-gray-800'>School Dashboard</h2>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <div className='bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow'>
            <h4 className='text-xl font-semibold mb-6 text-center text-gray-700'>Dashboard Overview</h4>
            <Image
              className="w-full h-auto rounded-xl"
              src="/schooldashboard1.svg"
              alt="School dashboard overview"
              width={600}
              height={400}
            />
          </div>
          <div className='bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow'>
            <h4 className='text-xl font-semibold mb-6 text-center text-gray-700'>Performance Analytics</h4>
            <Image
              className="w-full h-auto rounded-xl"
              src="/schooldashboard2.svg"
              alt="School dashboard analytics"
              width={600}
              height={400}
            />
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className='bg-[#0042D2] w-full mt-10 py-20'>
        <div className=' bg-white rounded-3xl mx-6 md:mx-10 p-8 md:p-16 shadow-2xl'>
          <h3 className='text-3xl md:text-5xl text-center font-extrabold mb-10 text-gray-800'>About Us</h3>

          <div className='flex flex-col md:flex-row gap-12 items-center mb-20'>
            <div className='flex-1'>
              <h4 className='text-3xl font-bold mb-5 text-[#0042D2]'>Practivoo is an app that helps:
              </h4>
              <ul className='list-disc ml-6 space-y-4 text-xl text-gray-700 leading-relaxed'>
                <li>teachers monitor their students’ progress effortlessly.
                </li>
                <li>provides automatic reports showing minimum and maximum scores, common
                  mistakes, and overall performance.</li>

              </ul>
            </div>
            <div className='flex-1 flex justify-center'>
              <img className="w-full max-w-md rounded-2xl shadow-lg" src="/about1.svg" alt="Teacher dashboard features" />
            </div>
          </div>

          <div className='flex flex-col md:flex-row-reverse gap-12 items-center'>
            <div className='flex-1'>
              <h4 className='text-3xl font-bold mb-5 text-[#0042D2]'>For students, Practivoo acts like:</h4>
              <ul className='list-disc ml-6 space-y-4 text-xl text-gray-700 leading-relaxed'>
                <li>A personal "teacher at home," available anytime</li>
                <li>Helping them pronounce words correctly with instant feedback</li>
                <li>Review what they learned in class, keeping practice consistent between lessons</li>
              </ul>
            </div>
            <div className='flex-1 flex justify-center'>
              <img className="w-full max-w-md rounded-2xl shadow-lg" src="/about2.svg" alt="Student app features" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className=' relative bg-blue-100 px-6 md:px-10 py-20 overflow-hidden'>
        <div className='absolute -left-20 top-20 w-40 h-40 bg-blue-200 rounded-full opacity-40 blur-2xl'></div>
        <div className='absolute -right-20 bottom-40 w-48 h-48 bg-purple-200 rounded-full opacity-40 blur-2xl'></div>

        <h2 className='text-3xl md:text-5xl font-extrabold text-center mb-20 text-gray-800'>Features</h2>

        {/* Feature 1 */}
        <div className=' mx-10  grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32'>
          <div className='space-y-6 relative z-10'>
            <div className='w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-300'>
              <div className='w-6 h-6 border-2 border-gray-600 rounded-full flex items-center justify-center'>
                <div className='w-2 h-2 bg-gray-600 rounded-full'></div>
              </div>
            </div>
            <h3 className='text-2xl md:text-4xl font-extrabold leading-tight text-gray-800'>
              Customised, Autocorrected<br />
              Exercises aligned with each<br />
              subject's syllabus
            </h3>
          </div>
          <div className='relative z-10 flex justify-center'>
            <img
              className="w-full max-w-lg shadow-2xl rounded-2xl transform hover:scale-105 transition-transform"
              src="/feature-exercise1.png"
              alt="Customized exercises feature"
            />
          </div>
        </div>

        {/* Feature 2 */}
        <div className=' mx-10  grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div className='order-2 lg:order-1 relative z-10 flex justify-center'>
            <img
              className="w-full max-w-lg shadow-2xl rounded-2xl transform hover:scale-105 transition-transform"
              src="/feature-exercise2.png"
              alt="Interactive exercise formats"
            />
          </div>
          <div className='order-1 lg:order-2 space-y-6 relative z-10'>
            <div className='w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-300'>
              <div className='w-6 h-6 border-2 border-gray-600 rounded-full flex items-center justify-center'>
                <div className='w-2 h-2 bg-gray-600 rounded-full'></div>
              </div>
            </div>
            <h3 className='text-2xl md:text-4xl font-extrabold leading-tight text-gray-800'>
              Interactive and engaging<br />
              exercise formats
            </h3>
          </div>
        </div>
      </section>

      {/* Why Choose Practivoo Section */}
      <section className='mx-10 mt-10 relative rounded-3xl bg-white px-6 md:px-10 py-20 overflow-hidden'>
        <div className='absolute -right-16 top-10 w-32 h-32 bg-yellow-200 rounded-full opacity-50 blur-2xl'></div>
        <div className='absolute -left-16 bottom-20 w-40 h-40 bg-blue-200 rounded-full opacity-50 blur-2xl'></div>
        <div className='absolute right-1/4 bottom-10 w-24 h-24 bg-purple-200 rounded-full opacity-40 blur-xl'></div>

        <h2 className='text-3xl md:text-5xl font-extrabold text-center mb-16 text-gray-800'>
          Why Choose Practivoo?
        </h2>

        <div className=' mx-10  grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div className=' p-8 md:p-12 space-y-8 relative z-10'>
            <div className='bg-blue-100 rounded-3xl p-4'>

              <p className='font-bold leading-relaxed'>
                Fully automated homework assignment and correction</p>
            </div>

            <div>

              <p className='leading-relaxed'>

                <span className='font-bold'>Engaging and varied exercise types </span>(fill-in-the-gaps, find the mistakes, match the
                pictures, multiple choice, sentence completion, word order tasks)              </p>
            </div>

            <div>

              <p className='font-bold leading-relaxed'>

                100% customised content aligned with each school’s syllabus, set up for the entire
                school year
              </p>
            </div>
          </div>

          <div className='flex justify-center relative z-10'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[3rem] blur-2xl opacity-30 scale-105'></div>
              <img
                className="relative w-full max-w-sm shadow-2xl rounded-[3rem] transform hover:scale-105 transition-transform"
                src="/phone-mockup.png"
                alt="Practivoo mobile app interface"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='relative bg-gradient-to-br from-blue-100 to-purple-100 px-6 md:px-10 py-20'>
        <div className='max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-16 shadow-2xl text-center'>
          <div className='flex justify-center mb-6'>
            <Image
              className='w-16 h-16'
              src="/Logo.png"
              alt="Practivoo"
              width={64}
              height={64}
            />
          </div>
          <h2 className='text-3xl md:text-4xl font-extrabold mb-6 text-gray-800 leading-tight'>
            Where Schools, Teachers, and<br />
            Students Grow Together
          </h2>
          <div className='flex flex-col sm:flex-row justify-center items-center gap-4 mt-10'>
            <Image
              src="/googleplay.png"
              alt="Get it on Google Play"
              width={150}
              height={50}
              className='hover:scale-105 transition-transform cursor-pointer'
            />
            <Image
              src="/appstore.png"
              alt="Download on App Store"
              width={150}
              height={50}
              className='hover:scale-105 transition-transform cursor-pointer'
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className='bg-[#0042D2] px-6 md:px-10 py-20'>
        <div className=' mx-10 '>
          <h2 className='text-3xl md:text-5xl font-extrabold text-center mb-12 text-white'>Pricing</h2>

          <div className='grid grid-cols-1 font-bold lg:grid-cols-2 gap-8'>
            {/* For Schools */}
            <div className='bg-white rounded-3xl p-8 md:p-10 shadow-2xl'>
              <h3 className='text-5xl  mb-6 text-gray-800'>For Schools</h3>
              <p className='text-lg  mb-6 text-gray-700 '>
                Contact us for a customized quote tailored to your school's size and needs.
              </p>
              <h4 className='font-bold text-lg mb-6'>What's Included</h4>

              <ul className='space-y-4 mb-8'>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Full access to all features for teachers, students, and administrators</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Unlimited content creation and assignment tracking</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Dedicated support and regular training sessions</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Analytics dashboard for school-wide performance monitoring</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Integration with existing school management systems</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Custom branding options for a personalized experience</p>
                </li>
              </ul>
            </div>

            {/* For Individual */}
            <div className='bg-white font-bold rounded-3xl p-8 md:p-10 shadow-2xl'>
              <h3 className='text-5xl font-bold mb-6 text-gray-800'>For Individual</h3>
              <p className='text-lg mb-6 text-gray-700'>
                <span className='text-2xl  text-[#0042D2]'> €120</span> (annually / student)
              </p>
              <h4 className='font-bold text-lg mb-6'>What's Included</h4>

              <ul className='space-y-4 mb-8'>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Access to all interactive lesson activities (free 4 quizzes)</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Ability to track your child's progress in real-time</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Instant feedback and autocorrection on all exercises</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Access to progress reports showing areas of improvement</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Gamification elements (badges, leaderboards)</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Personalized progress monitoring for better learning outcomes</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>One-on-one assistance and parental guides</p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-[#0042D2] rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>Easy access to personalized content through subscription</p>
                </li>
              </ul>

              <div className='flex justify-end'>
                <button className='bg-[#0042D2] text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md'>
                  Subscribe Now
                  <ArrowRightCircle size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <FAQSection />

      {/* Let's Get In Touch Section */}
      <section className=' px-6 md:px-10 py-20'>
        <div className='max-w-2xl mx-auto'>
          <h2 className='text-3xl md:text-5xl font-extrabold text-center mb-4 text-gray-800'>
            Let's Get In Touch
          </h2>
          <p className='text-center text-gray-600 text-lg mb-12'>
            We'd love to learn more about you and how we can help you.
          </p>

          <div className='bg-white rounded-3xl p-8 md:p-12 shadow-2xl'>
            <h3 className='text-2xl font-bold text-center mb-8 text-gray-800'>Fill Up The Form</h3>

            <form className='space-y-6'>
              <div>
                <input
                  type='text'
                  placeholder='Enter your name'
                  className='w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-[#0042D2] focus:outline-none text-gray-700 transition-colors'
                />
              </div>

              <div>
                <input
                  type='email'
                  placeholder='Enter your email'
                  className='w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-[#0042D2] focus:outline-none text-gray-700 transition-colors'
                />
              </div>

              <div>
                <textarea
                  placeholder='Enter Your Message'
                  rows={5}
                  className='w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-[#0042D2] focus:outline-none text-gray-700 resize-none transition-colors'
                ></textarea>
              </div>

              <div className='flex justify-center pt-4'>
                <button
                  type='submit'
                  className='bg-[#0042D2] text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg'
                >
                  Submit
                  <ArrowRightCircle size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-[#0042D2] text-white px-6 md:px-10 py-12'>
        <div className=' mx-10 '>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-12 mb-8'>
            {/* Brand Section */}
            <div>
              <div className='flex items-center gap-3 mb-4'>
                <Image
                  src="/Practivoo_Logo.png"
                  alt="Practivoo Logo"
                  width={50}
                  height={50}
                  className=''
                />
                <h3 className='text-2xl font-bold'>Practivoo</h3>
              </div>
              <p className='text-blue-100 text-sm leading-relaxed mb-6'>
                Empowering education through innovative technology. Where schools, teachers, and students grow together.
              </p>
              <div className='flex gap-4'>
                <Image
                  src="/googleplay.png"
                  alt="Get it on Google Play"
                  width={120}
                  height={40}
                  className='cursor-pointer hover:scale-105 transition-transform'
                />
                <Image
                  src="/appstore.png"
                  alt="Download on App Store"
                  width={120}
                  height={40}
                  className='cursor-pointer hover:scale-105 transition-transform'
                />
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className='text-lg font-bold mb-4'>Company</h4>
              <ul className='space-y-3'>
                <li><a href='#' className='text-blue-100 hover:text-white transition-colors'>Information</a></li>
                <li><a href='#aboutus' className='text-blue-100 hover:text-white transition-colors'>About Us</a></li>
                <li><a href='#' className='text-blue-100 hover:text-white transition-colors'>More Search</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className='text-lg font-bold mb-4'>Support</h4>
              <ul className='space-y-3'>
                <li><a href='#faq-section' className='text-blue-100 hover:text-white transition-colors'>FAQ</a></li>
                <li><a href='#support' className='text-blue-100 hover:text-white transition-colors'>Support</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className='border-t border-blue-400 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-blue-100 text-sm'>
              © {new Date().getFullYear()} Practivoo. All rights reserved.
            </p>
            <div className='flex gap-4'>
              <a href='#' className='text-blue-100 hover:text-white transition-colors'>
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' />
                </svg>
              </a>
              <a href='#' className='text-blue-100 hover:text-white transition-colors'>
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z' />
                </svg>
              </a>
              <a href='#' className='text-blue-100 hover:text-white transition-colors'>
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}