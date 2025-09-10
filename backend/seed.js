const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Alert = require('./models/Alert');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_management';

async function connectDb() {
	await mongoose.connect(MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}

async function upsertUser({ name, email, password, role, phone, location }) {
	let user = await User.findOne({ email });
	if (!user) {
		user = await User.create({ name, email, password, role, phone, location });
	}
	return user;
}

function hoursFromNow(hours) {
	return new Date(Date.now() + hours * 60 * 60 * 1000);
}

async function seed() {
	try {
		await connectDb();

		const admin = await upsertUser({
			name: 'Admin User',
			email: 'admin@example.com',
			password: 'admin123',
			role: 'admin',
			phone: '+1 555-000-0000',
			location: {
				type: 'Point',
				coordinates: [77.5946, 12.9716],
				city: 'Bengaluru',
				country: 'India'
			}
		});

		const user = await upsertUser({
			name: 'Demo User',
			email: 'user@example.com',
			password: 'user123',
			role: 'user',
			phone: '+1 555-111-1111',
			location: {
				type: 'Point',
				coordinates: [72.8777, 19.0760],
				city: 'Mumbai',
				country: 'India'
			}
		});

		// Clear existing sample alerts tagged with seed
		await Alert.deleteMany({ 'metadata.source': 'seed' });

		const now = new Date();

		const alerts = [
			{
				title: 'High-Risk Landslide Warning - Western Ghats',
				description: 'Advanced disaster management system providing real-time alerts for landslides due to continuous heavy rainfall. Avoid steep slopes and travel only if necessary. Follow official advisories and keep emergency kits ready.',
				type: 'landslide',
				severity: 'high',
				status: 'active',
				location: {
					type: 'Point',
					coordinates: [76.2711, 9.9312],
					address: 'Idukki District',
					state: 'Kerala',
					country: 'India',
					radius: 25
				},
				affectedAreas: [
					{ name: 'Munnar', coordinates: [77.062, 10.089], population: 68000, riskLevel: 'high' },
					{ name: 'Adimali', coordinates: [76.969, 10.006], population: 36000, riskLevel: 'medium' }
				],
				weatherData: { temperature: 22, humidity: 95, precipitation: 120, windSpeed: 18, lastUpdated: now },
				safetyInstructions: [
					{ title: 'Evacuate low-lying slopes', description: 'Move to designated shelters if near steep slopes or recent cuts.', priority: 'high' },
					{ title: 'Avoid travel', description: 'Do not drive near hill cuts, landslide-prone zones, or flooded crossings.', priority: 'medium' }
				],
				emergencyContacts: [
					{ name: 'District Control Room', phone: '+91-0000-111111', type: 'emergency' },
					{ name: 'Local Fire Station', phone: '101', type: 'fire' }
				],
				shelters: [
					{ name: 'Govt School Shelter', address: 'Adimali', coordinates: [76.97, 10.01], capacity: 300, currentOccupancy: 45, facilities: ['water', 'food', 'medical'], contact: '+91-0000-222222' }
				],
				resources: [
					{ title: 'Landslide Safety Guide', description: 'Do’s and Don’ts during landslides', type: 'document', url: 'https://ndma.gov.in', fileSize: 1024 }
				],
				validFrom: now,
				validUntil: hoursFromNow(48),
				createdBy: admin._id,
				isPublic: true,
				tags: ['landslide', 'kerala', 'rainfall'],
				metadata: { source: 'seed', confidence: 0.9, verified: true },
				statistics: { views: 0, shares: 0, acknowledgments: 0 }
			},
			{
				title: 'Urban Flood Alert - Mumbai Metropolitan Region',
				description: 'Advanced disaster management system real-time flood alert: Extremely heavy rain causing waterlogging and flash floods in low-lying areas. Avoid coastal roads and underpasses. Move vehicles to higher ground.',
				type: 'flood',
				severity: 'critical',
				status: 'active',
				location: {
					type: 'Point',
					coordinates: [72.8777, 19.0760],
					address: 'Mumbai',
					state: 'Maharashtra',
					country: 'India',
					radius: 30
				},
				affectedAreas: [
					{ name: 'Sion', coordinates: [72.862, 19.045], population: 150000, riskLevel: 'high' },
					{ name: 'Kurla', coordinates: [72.881, 19.072], population: 180000, riskLevel: 'critical' }
				],
				weatherData: { temperature: 26, humidity: 98, precipitation: 220, windSpeed: 22, lastUpdated: now },
				safetyInstructions: [
					{ title: 'Avoid flooded roads', description: 'Do not walk or drive through floodwaters.', priority: 'high' },
					{ title: 'Turn off electricity', description: 'Switch off main power if water enters your home.', priority: 'high' }
				],
				emergencyContacts: [
					{ name: 'Mumbai Police', phone: '100', type: 'police' },
					{ name: 'Municipal Helpline', phone: '1916', type: 'emergency' }
				],
				shelters: [
					{ name: 'BMC Shelter - Sion', address: 'Sion', coordinates: [72.862, 19.045], capacity: 500, currentOccupancy: 120, facilities: ['water', 'food', 'blankets'], contact: '1916' }
				],
				resources: [
					{ title: 'Flood Safety Tips', description: 'How to stay safe during floods', type: 'link', url: 'https://www.who.int/health-topics/floods' }
				],
				validFrom: now,
				validUntil: hoursFromNow(24),
				createdBy: admin._id,
				isPublic: true,
				tags: ['flood', 'mumbai', 'urban'],
				metadata: { source: 'seed', confidence: 0.95, verified: true }
			},
			{
				title: 'Severe Weather Alert - Cyclonic Winds and Heavy Rain',
				description: 'Advanced disaster management system alert: Severe weather system bringing cyclonic winds and very heavy rainfall. Secure loose objects, avoid coastal journeys, and follow evacuation orders where issued.',
				type: 'severe_weather',
				severity: 'high',
				status: 'active',
				location: {
					type: 'Point',
					coordinates: [80.2707, 13.0827],
					address: 'Chennai',
					state: 'Tamil Nadu',
					country: 'India',
					radius: 40
				},
				affectedAreas: [
					{ name: 'Marina Beach', coordinates: [80.282, 13.050], population: 50000, riskLevel: 'medium' },
					{ name: 'Velachery', coordinates: [80.220, 12.980], population: 140000, riskLevel: 'high' }
				],
				weatherData: { temperature: 28, humidity: 92, precipitation: 160, windSpeed: 65, windDirection: 210, lastUpdated: now },
				safetyInstructions: [
					{ title: 'Stay indoors', description: 'Remain inside and away from windows during high winds.', priority: 'high' },
					{ title: 'Prepare emergency kit', description: 'Water, non-perishable food, torch, power bank, medicines.', priority: 'medium' }
				],
				emergencyContacts: [
					{ name: 'Cyclone Control Room', phone: '+91-0000-333333', type: 'emergency' }
				],
				shelters: [
					{ name: 'Community Hall Shelter', address: 'Velachery', coordinates: [80.22, 12.98], capacity: 400, currentOccupancy: 60, facilities: ['power', 'water', 'medical'], contact: '+91-0000-444444' }
				],
				resources: [
					{ title: 'Cyclone Readiness', description: 'NDMA cyclone preparedness', type: 'link', url: 'https://ndma.gov.in' }
				],
				validFrom: now,
				validUntil: hoursFromNow(36),
				createdBy: admin._id,
				isPublic: true,
				tags: ['severe-weather', 'cyclone', 'chennai'],
				metadata: { source: 'seed', confidence: 0.88, verified: true }
			}
		];

		await Alert.insertMany(alerts);

		console.log('Seeding completed successfully.');
	} catch (err) {
		console.error('Seeding failed:', err);
		process.exitCode = 1;
	} finally {
		await mongoose.disconnect();
	}
}

seed();
