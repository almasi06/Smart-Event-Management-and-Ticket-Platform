require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User    = require('../models/User');
const Event   = require('../models/Event');
const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Event.deleteMany({});
  await Booking.deleteMany({});
  await Enquiry.deleteMany({});

  console.log('Seeding users...');
  const admin = await User.create({
    name:     'Admin User',
    email:    'admin@advancedevents.co.za',
    password: 'Admin@1234',
    role:     'admin',
    phone:    '+27110001111',
  });

  const thabo = await User.create({
    name:     'Thabo Nkosi',
    email:    'thabo@example.com',
    password: 'User@1234',
    role:     'user',
    phone:    '+27821234567',
  });

  const lerato = await User.create({
    name:     'Lerato Dlamini',
    email:    'lerato@example.com',
    password: 'User@1234',
    role:     'user',
    phone:    '+27839876543',
  });

  const sipho = await User.create({
    name:     'Sipho Zulu',
    email:    'sipho@example.com',
    password: 'User@1234',
    role:     'user',
    phone:    '+27711112222',
  });

  console.log('   4 users inserted.');

  console.log('Seeding events...');
  const event1 = await Event.create({
    title:       'AfriTech Innovation Summit 2026',
    description: 'A premier conference bringing together tech leaders across Africa.',
    category:    'conference',
    date:        new Date('2026-07-15T09:00:00'),
    venue:       { name: 'Sandton Convention Centre', address: '161 Maude St', city: 'Sandton', province: 'Gauteng' },
    capacity:    500,
    ticketsSold: 312,
    ticketPrice: 1500,
    createdBy:   admin._id,
  });

  const event2 = await Event.create({
    title:       'Cape Town Jazz Festival',
    description: 'An unforgettable evening of world-class jazz talent.',
    category:    'music festival',
    date:        new Date('2026-08-22T16:00:00'),
    venue:       { name: 'CTICC', address: '1 Lower Long St', city: 'Cape Town', province: 'Western Cape' },
    capacity:    2000,
    ticketsSold: 1750,
    ticketPrice: 850,
    createdBy:   admin._id,
  });

  const event3 = await Event.create({
    title:       'Full-Stack Web Development Bootcamp',
    description: 'Intensive 2-day workshop covering Node.js, Express and MongoDB.',
    category:    'workshop',
    date:        new Date('2026-09-05T08:30:00'),
    venue:       { name: 'WeWork Rosebank', address: '173 Oxford Rd', city: 'Johannesburg', province: 'Gauteng' },
    capacity:    50,
    ticketsSold: 42,
    ticketPrice: 2500,
    createdBy:   admin._id,
  });

  const event4 = await Event.create({
    title:       'Durban Charity Gala Dinner 2026',
    description: 'An elegant gala evening raising funds for education.',
    category:    'private',
    date:        new Date('2026-10-10T18:00:00'),
    venue:       { name: 'The Oyster Box Hotel', address: '2 Lighthouse Rd', city: 'Umhlanga', province: 'KwaZulu-Natal' },
    capacity:    150,
    ticketsSold: 80,
    ticketPrice: 3500,
    createdBy:   admin._id,
  });

  const event5 = await Event.create({
    title:       'StartUp Joburg Networking Mixer',
    description: 'Monthly networking event for founders and investors.',
    category:    'conference',
    date:        new Date('2026-06-20T17:30:00'),
    venue:       { name: 'The Workshop', address: '99 Jeppe St', city: 'Johannesburg', province: 'Gauteng' },
    capacity:    100,
    ticketsSold: 65,
    ticketPrice: 200,
    createdBy:   admin._id,
  });

  console.log('   5 events inserted.');

  console.log('Seeding bookings...');
  await Booking.create({ user: thabo._id,  event: event1._id, quantity: 2, totalPrice: 3000, status: 'confirmed', attendeeDetails: { name: thabo.name,  email: thabo.email  } });
  await Booking.create({ user: lerato._id, event: event2._id, quantity: 1, totalPrice: 850,  status: 'confirmed', attendeeDetails: { name: lerato.name, email: lerato.email } });
  await Booking.create({ user: sipho._id,  event: event3._id, quantity: 1, totalPrice: 2500, status: 'confirmed', attendeeDetails: { name: sipho.name,  email: sipho.email  } });
  await Booking.create({ user: thabo._id,  event: event5._id, quantity: 3, totalPrice: 600,  status: 'confirmed', attendeeDetails: { name: thabo.name,  email: thabo.email  } });
  await Booking.create({ user: lerato._id, event: event1._id, quantity: 1, totalPrice: 1500, status: 'cancelled', cancellationReason: 'Schedule conflict', attendeeDetails: { name: lerato.name, email: lerato.email } });
  console.log('   5 bookings inserted.');

  console.log('Seeding enquiries...');
  await Enquiry.create({ user: thabo._id,  event: event1._id, name: thabo.name,  email: thabo.email,  subject: 'Event Information', message: 'Will there be vegetarian meal options at the AfriTech Summit?', status: 'Pending' });
  await Enquiry.create({ user: lerato._id, name: lerato.name, email: lerato.email, subject: 'Refund Request',  message: 'I cancelled my ticket for the jazz festival. When can I expect my refund?', status: 'Responded', adminNotes: 'Refund initiated 2026-05-01' });
  await Enquiry.create({ name: 'John Smith', email: 'john.smith@example.com', subject: 'General Enquiry', message: 'Do you host private corporate team-building events?', status: 'Closed' });
  console.log('   3 enquiries inserted.');

  console.log('\n Database seeded successfully!\n');
  console.log('─────────────────────────────────');
  console.log('Admin:  admin@advancedevents.co.za  /  Admin@1234');
  console.log('User:   thabo@example.com           /  User@1234');
  console.log('─────────────────────────────────\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});