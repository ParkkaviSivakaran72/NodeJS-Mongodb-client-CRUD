const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const db = require('./db');
const { ObjectId } = db; // Ensure ObjectId is imported properly

// Handlebars Configuration
app.engine('hbs', exphbs.engine({ layoutsDir: 'views/', defaultLayout: 'main', extname: 'hbs' }));
app.set('view engine', 'hbs');
app.set('views', 'views');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// GET: Home Page
app.get('/', async (req, res) => {
    let database = await db.getDatabase();
    const collection = database.collection('workers');
    const workers = await collection.find({}).toArray();
    let message = '';
    let edit_id = req.query.edit_id;
    let edit_detail = null;

    
    // If `edit_id` is provided, fetch the worker details
    if (edit_id) {
        try {
            edit_detail = await collection.findOne({ _id: new ObjectId(edit_id) });
        } catch (err) {
            console.error('Invalid ObjectId:', err);
            message = 'Invalid edit ID.';
        }
    }
    if(req.query.delete_id){
        collection.deleteOne({_id:req.query.delete_id})
        return res.redirect('/?status=3')
    }

    // Handle status messages
    switch (req.query.status) {
        case '1':
            message = 'Inserted successfully.';
            break;
        case '2':
            message = 'Updated successfully.';
            break;
        case '3':
            message = 'Deleted successfully.'
        default:
            message = message || 'Welcome!';
    }

    // Render the view
    res.render('main', { message, workers, edit_id, edit_detail });
});

// POST: Store Worker Details
app.post('/store_details', async (req, res) => {
    let database = await db.getDatabase();
    const collection = database.collection('workers');

    // Create worker object
    const worker = {
        name: req.body.name,
        age: req.body.age,
        company: req.body.company,
        email: req.body.email,
        phone: req.body.phone,
    };

    // Insert worker into database
    await collection.insertOne(worker);

    // Redirect with success status
    res.redirect('/?status=1');
});

// POST: Update Worker Details
app.post('/update_details/:edit_id', async (req, res) => {
    let database = await db.getDatabase();
    const collection = database.collection('workers');

    const edit_id = req.body.edit_id; // Retrieve `edit_id` from request body

    // Create updated worker object
    const worker = {
        name: req.body.name,
        age: req.body.age,
        company: req.body.company,
        email: req.body.email,
        phone: req.body.phone,
    };

    try {
        // Update worker details
        await collection.updateOne({ _id: new ObjectId(edit_id) }, { $set: worker });
        res.redirect('/?status=2');
    } catch (err) {
        console.error('Invalid ObjectId:', err);
        res.redirect('/?status=error');
    }
});

// Start the server
app.listen(8000, () => {
    console.log('Listening on port 8000');
});
