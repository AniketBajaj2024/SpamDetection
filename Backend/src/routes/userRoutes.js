const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prismaClient');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Rout for registration with phone number , name , email and password
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('phone').isMobilePhone().withMessage('A valid phone number is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password shuld be at least 6 characters long'),
    ],
    async (req, res) => {

        console.log("inside register route");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { name, phone, email, password } = req.body;


            // Check if the user already exists
            const existingUser = await prisma.user.findUnique({ where: { phone } });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }



            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: { name, phone, email, password: hashedPassword },
            });

            res.status(201).json(user);
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);


// Route for login with phone number and password
router.post(
    '/login',
    [
        body('phone').isMobilePhone().withMessage('A valid phone number is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {

        console.log("inside login route");
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        try {
            const { phone, password } = req.body;
            const user = await prisma.user.findUnique({ where: { phone } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            const token = jwt.sign(
                { id: user.id, phone: user.phone },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.status(200).json({ message: 'Login Succssful!', token });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Route for getting profile

router.get('/profile', authenticateToken, async (req, res) => {

    console.log("inside profile route");
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Error' });
    }
});



// Route for updating profile
router.post('/report', authenticateToken, async (req, res) => {

    console.log("inside report route");
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required to report spam' });
    }

    try {
        console.log('Creating Spam Report:', { phone, reporterId: req.user.id });
        const spamReport = await prisma.spamReport.create({
            data: {
                phone,           // The number being reported as spam
                reporterId: req.user.id, // The logged-in user's ID
            },
        });

        // console.log(spamReport);
        res.status(201).json({ message: 'Spam reported', spamReport });
    } catch (error) {
        console.error('Error reporting spam:', error);
        res.status(500).json({ error: 'Errorr' });
    }
});


// Route for adding contacts
router.post('/contacts', authenticateToken, async (req, res) => {
    console.log("inside contacts route");
    const { name, phone } = req.body;
    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone number are required to add a contact.' });
    }
    try {
        const contact = await prisma.contact.create({
            data: {
                userId: req.user.id,  // The owner of this contact
                name,
                phone,
            },
        });

        console.log(contact);
        res.status(201).json({ message: 'Contact added', contact });
    } catch (error) {
        console.error('Error adding contact:', error);
        res.status(500).json({ error: 'Err' });
    }
});


// Route for getting contacts
router.get('/contacts', authenticateToken, async (req, res) => {
    console.log("inside getting contacts route");
    try {
        const contacts = await prisma.contact.findMany({
            where: { userId: req.user.id },
        });

        // console.log(contacts)

        res.status(200).json({ contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'errror' });
    }
});




// Route for searching phone numbers
router.get('/search', authenticateToken, async (req, res) => {
    console.log("inside search route");
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ error: 'Name is reqd to search' });
    }
    try {
        const startsWithResults = await prisma.user.findMany({
            where: { name: { startsWith: name, mode: 'insensitive' } },
            select: { name: true, phone: true, spamReports: true },
        });

        // console.log(startsWithResults);
        const containsResults = await prisma.user.findMany({
            where: { name: { contains: name, mode: 'insensitive' } },
            select: { name: true, phone: true, spamReports: true },
        });

        // console.log(containsResults);
        const combinedResults = [
            ...startsWithResults,
            ...containsResults.filter(result => !startsWithResults.some(r => r.phone === result.phone)),
        ];
        // console.log(combinedResults);
        const resultsWithSpamLikelihood = combinedResults.map(result => ({
            ...result,
            spamLikelihood: result.spamReports.length,
        }));
        // console.log(resultsWithSpamLikelihood);
        res.status(200).json({ results: resultsWithSpamLikelihood });
    } catch (error) {
        console.error('Error searching user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});



// Route for searching phone numbers
router.get('/search/phone', authenticateToken, async (req, res) => {

    console.log("inside search phone route");
    const { phone } = req.query;
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is reqydd for search.' });
    }
    try {
        const registeredUser = await prisma.user.findUnique({
            where: { phone },
            select: { name: true, phone: true, email: true },
        });

        console.log(registeredUser);

        const spamCount = await prisma.spamReport.count({
            where: { phone },
        });
        if (registeredUser) {
            return res.status(200).json({
                name: registeredUser.name,
                phone: registeredUser.phone,
                email: registeredUser.email,
                spamLikelihood: spamCount,
            });
        } else {
            const contactResults = await prisma.contact.findMany({
                where: { phone },
                select: { name: true, phone: true }  // Adjust fields as needed
            });
            if (contactResults.length > 0) {
                return res.status(200).json({ results: contactResults });
            } else {
                return res.status(404).json({ error: 'No results found.' });
            }
        }
        return res.status(404).json({ error: 'Phone number not found or not registered.' });
    } catch (error) {
        console.error('Error searching by phone:', error);
        res.status(500).json({ error: 'error' });
    }
});



// Route for getting user details by ID (if the logged in user has the contact of searched numbr then all the details will be shown otherwise all the details will be shown except email)
router.get('/:id', authenticateToken, async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    try {
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            include: {
                spamReports: true,
                contacts: true,
            },
        });
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isInContacts = targetUser.contacts.some(
            (contact) => contact.phone === req.user.phone
        );
        const userDetails = {
            id: targetUser.id,
            name: targetUser.name,
            phone: targetUser.phone,
            spamLikelihood: targetUser.spamReports.length,
            email: isInContacts ? targetUser.email : undefined,
        };

        // console.log(userDetails);

        res.status(200).json({ user: userDetails });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'err' });
    }
});

module.exports = router;