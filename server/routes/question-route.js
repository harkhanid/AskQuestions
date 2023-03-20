const express = require('express');
const router = express.Router();
const questionController    = require('../controllers/question-controller');
const fileController        = require('../controllers/file-controller');
const question = require('../models/question');

/* GET home page. */
router.route('/question')
    .post(questionController.createQuestion);

router.route('/questions')
    .get(questionController.getAllQuestions);

router.route('/question/:id/answer')
    .post(questionController.createAnswer);

router.route('/question/:id')
    .delete(questionController.deleteQuestion)
    .put(questionController.updateQuestion)
    .get(questionController.getQuestion);

router.route('/question/:id/file')
    .post(fileController.postQuestionImage);

router.route('/question/:qid/answer/:id/file')
    .post(fileController.postAnswerImage);

router.route('/question/:qid/answer/:aid')
    .delete(questionController.deleteAnswer)
    .put(questionController.updateAnswer)
    .get(questionController.getAnswer);

router.route('/question/:qid/file/:fid')
    .delete(fileController.deleteQuestionImage);
router.route('/question/:qid/answer/:aid/file/:fid')
    .delete(fileController.deleteAnswerImage);
    

module.exports = router;