require('../models/database')
const Category = require('../models/Category')
const Recipe = require('../models/Recipe')

exports.homepage = async(req, res) => {
    try{
        const limitNumber = 5;
        const categories = await Category.find({}).limit(limitNumber);
        const latest = await Recipe.find({}).sort({ _id: -1 }).limit(5);
        const thai = await Recipe.find({ 'category': 'Thai' }).limit(5);
        const american = await Recipe.find({ 'category': 'American' }).limit(5);
        const chinese = await Recipe.find({ 'category': 'Chinese' }).limit(5);
        const food = {
            latest,
            thai,
            american,
            chinese,
        };

        res.render('index', {title: 'Homepage', categories, food});
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured"})
    }

}


/**
 * 
 * Get Categories
 * */ 

exports.exploreCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).limit(20);
        res.render('categories', { title: 'Categories', categories });
    } catch (error){
        res.status(500).send({ message: error.message || "Error Occured" })
    }

}

/**
 * 
 * Get Single Category
 * */

exports.exploreCategoriesById = async (req, res) => {
    try {
        let categoryId = req.params.id;
        const categoryById = await Recipe.find({'category': categoryId}).limit(10);
        res.render('categories', { title: 'Categories', categoryById });
    } catch(error) {
        res.status(500).send({ message: error.message || "Error Occured" })
    }
}


/**
 * 
 * Get Single Recipe
 * */

exports.exploreRecipe = async (req, res) => {
    try {
        let recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId)
        res.render('recipe', { title: 'Recipe', recipe });
    } catch(error) {
        res.status(500).send({ message: error.message || "Error Occured" })
    }
}


/**
 * 
 * Post /search
 * search
 * */

exports.searchRecipe = async (req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        let recipe = await Recipe.find({ $text: { $search: searchTerm, $diacriticSensitive: true } });
        res.render('search', { title: 'Cooking Blog - Search', recipe });
    } catch (error) {
        res.satus(500).send({ message: error.message || "Error Occured" });
    }

}

/**
 * 
 * GET /submit-recipe
 * Submit Recipe
 * */

exports.submitRecipe = async(req, res) => {
    const infoErrorsObj = req.flash('infoError');
    const infoSubmitObj = req.flash('infoSubmit');

    res.render('submit-recipe', { title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitObj });
}

exports.submitRecipeOnPost = async (req, res) => {  

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No Files where uploaded.');
    } else {

        imageUploadFile = req.files.image;
        newImageName = Date.now() + imageUploadFile.name;

        uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

        imageUploadFile.mv(uploadPath, function (err) {
            if (err) return res.satus(500).send(err);
        })

    }

    try{
        const newRecipe = new Recipe({
            name: req.body.name,
            description: req.body.description,
            email: req.body.email,
            ingredients: req.body.ingredient,
            category: req.body.category,
            image: newImageName
        });

        await newRecipe.save();

        req.flash('infoSubmit', 'Recipe has been added Successfully');
        res.redirect('/submit-recipe');
    }catch(error){
        req.flash('infoError', error);
        res.redirect('/submit-recipe');
    }
   
}