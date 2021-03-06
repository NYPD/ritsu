/* eslint-env mocha */
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
// eslint-disable-next-line no-unused-vars
const should = chai.should();

const jsdom = require('jsdom').jsdom;
const window = jsdom().defaultView;

global.NodeList = window.NodeList;
global.HTMLCollection = window.HTMLCollection;
global.jQuery = require('jquery')(window); //need global for the jQueryIsPresent variable in core js

const rules = require('../src/rules.js')();
const validation = require('../src/validation.js')(rules);

const core = require('../src/core.js')(rules, validation);

describe('core', function() {

  describe('#initialize()', function() {

    it('should throw an error when the options parameter passed in is not an object', function() {
      expect(function() {
        core.initialize('init');
      }).to.throw(Error);
    });

    it('should pass when the options parameter passed in is any object', function() {

      var options = {
        useBootstrap3Stlying: true,
        autoMarkInvalidFields: false,
        autoShowErrorMessages: true,
        coolBeans: 'really cool'
      };

      expect(function() {
        core.initialize(options);
      }).to.not.throw(Error);

    });

    it('should throw an Error when the messageCallback property passed in is not a function', function() {
      expect(function() {

        var options = {
          messageCallback: 'cool beans'
        };

        core.initialize(options);
      }).to.throw(Error);
    });

    it('should pass when the messageCallback property passed in is a function', function() {
      expect(function() {

        var options = {
          messageHandler: function() {}
        };

        core.initialize(options);

      }).to.not.throw(Error);
    });

    //Clean up the ristu object to the defaults
    after(function() {
      core.initialize({});
    });

  });

  describe('#storeInitialFormValues()', function() {

    it('should store the initial value of a text input element passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="bob"/>');

      let input = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(input);

      //change the current value
      input.value = 'crepes';

      let intialValue = input.getAttribute('data-initial-value');
      assert.strictEqual(intialValue, 'bob');

    });

    it('should store the initial value of a text input element on the document since nothing was passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="benzi"/>');

      core.storeInitialFormValues();
      let input = document.getElementsByTagName('input')[0];

      //change the current value
      input.value = 'crepes';

      let intialValue = input.getAttribute('data-initial-value');
      assert.strictEqual(intialValue, 'benzi');

    });

    it('should store the initial value of a checkbox input element passed in', function() {

      global.document = jsdom('<input type="checkbox" checked/>');

      let checkbox = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(checkbox);

      //Make sure this checkbox is checked
      var checkboxIsChecked = checkbox.checked === true;
      assert.isTrue(checkboxIsChecked);

      //change the current value
      checkbox.checked = false;

      //Make sure it remembers the original checkbox state and this checkbox is unchecked
      var intialValue = checkbox.getAttribute('data-initial-value');
      var checkboxIsUnchecked = checkbox.checked === false;

      assert.strictEqual(intialValue, 'true');
      assert.isTrue(checkboxIsUnchecked);

    });

    it('should store the initial value of a radio input element passed in', function() {

      global.document = jsdom('<input type="radio" name="sex" value="male" id="male" checked/>' +
        '<input type="radio" name="sex" value="female" id="female"/>');

      core.storeInitialFormValues();

      let maleRadio = document.getElementById('male');
      let femaleRadio = document.getElementById('female');

      //Make sure radio male button is checked
      assert.strictEqual(maleRadio.checked, true);
      assert.strictEqual(femaleRadio.checked, false);

      //change the current value
      femaleRadio.click();

      //Make sure it remembers the original radio states and that the female radio is checked
      let intialValueOfMale = document.getElementById('male').getAttribute('data-initial-value');
      let intialValueOfFemale = document.getElementById('female').getAttribute('data-initial-value');

      assert.strictEqual(intialValueOfMale, 'true');
      assert.strictEqual(intialValueOfFemale, 'false');


      //Make sure radio female button is checked
      assert.strictEqual(maleRadio.checked, false);
      assert.strictEqual(femaleRadio.checked, true);

    });

    //Cant test out a file input too well. Just check to see if an initial value is stored
    it('should store the initial value for a file input element passed in', function() {

      global.document = jsdom('<input type="file" data-simple-file-hash="easyFileHash420" />');

      let fileInput = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(fileInput);

      var intialValue = fileInput.getAttribute('data-initial-value');
      assert.strictEqual(intialValue, 'easyFileHash420');

    });

    after(function() {
      global.document = null;
    });

  });

  describe('#getInitialFormValue()', function() {

    it('should get the intial value of a text input', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="benzi"/>');

      let input = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(input);

      var initalValue = core.getInitialFormValue(input);
      assert.strictEqual(initalValue, 'benzi');

    });


    it('should return null if no element is found to get the intial value', function() {

      var initalValue = core.getInitialFormValue('#no-element');
      assert.strictEqual(initalValue, null);

    });

  });

  describe('#resetInitialFormValues()', function() {

    it('should reset the intial value of a text input', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="benzi"/>');

      let input = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(input);

      input.value = 'new value';

      var isDirty = core.isFormDirty();
      assert.strictEqual(isDirty, true);

      core.resetInitialFormValues(input);

      isDirty = core.isFormDirty();
      assert.strictEqual(isDirty, false);

    });

    it('should reset the intial value of mulitple inputs', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" id="input1"  value="benzi"/>' +
        '<input type="text" class="alpha alpha-only" id="input2"  value="benzi"/>');

      let input1 = document.querySelector('#input1');
      let input2 = document.querySelector('#input2');

      core.storeInitialFormValues();

      input1.value = 'new val1';
      input2.value = 'new val2';

      var isDirty = core.isFormDirty();
      assert.strictEqual(isDirty, true);

      core.resetInitialFormValues();

      isDirty = core.isFormDirty();
      assert.strictEqual(isDirty, false);

    });


    it('should reset the intial value of a checkbox', function() {

      global.document = jsdom('<input type="checkbox" value="benzi" checked/>');

      let input = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(input);

      input.checked = false;

      var isDirty = core.isFormDirty();
      assert.strictEqual(isDirty, true);

      core.resetInitialFormValues(input);

      isDirty = core.isFormDirty();
      assert.strictEqual(isDirty, false);

    });

    it('should blow up and replace a file input', function() {

      global.document = jsdom('<input type="file" data-simple-file-hash="xx" data-initial-value="yy"/>');

      let input = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(input);

      let hasInitialValue = input.hasAttribute('data-initial-value');
      let hasFileHash = input.hasAttribute('data-simple-file-hash');

      assert.strictEqual(hasInitialValue, true);
      assert.strictEqual(hasFileHash, true);

      core.resetInitialFormValues(input);

      input = document.getElementsByTagName('input')[0]; //Its axtually a new element
      hasInitialValue = input.hasAttribute('data-initial-value');
      hasFileHash = input.hasAttribute('data-simple-file-hash');

      assert.strictEqual(hasInitialValue, false);
      assert.strictEqual(hasFileHash, false);

    });

  });

  describe('#isFormDirty()', function() {

    it('should not return dirty since nothing changed', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="benzi"/>');

      let input = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(input);

      var isDirty = core.isFormDirty(input);
      assert.isFalse(isDirty);

    });

    it('should return dirty for a text input element passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="benzi"/>');

      let input = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(input);

      //change the current value
      input.value = 'crepes';

      var isDirty = core.isFormDirty(input);
      assert.isTrue(isDirty);

    });

    it('should return dirty for a text input element on the document since nothing was passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="benzi"/>');

      core.storeInitialFormValues();

      //change the current value
      document.getElementsByTagName('input')[0].value = 'crepes';

      var isDirty = core.isFormDirty();
      assert.isTrue(isDirty);

    });

    it('should return dirty for a checkbox input element passed in', function() {

      global.document = jsdom('<input type="checkbox" checked/>');

      let checkbox = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(checkbox);

      //Make sure this checkbox is checked
      var checkboxIsChecked = checkbox.checked === true;
      assert.isTrue(checkboxIsChecked);

      //change the current value
      checkbox.checked = false;

      var isDirty = core.isFormDirty(checkbox);
      assert.isTrue(isDirty);

    });

    it('should return dirty for a radio input element passed in', function() {

      global.document = jsdom('<input type="radio" name="sex" value="male" id="male" checked/>' +
        '<input type="radio" name="sex" value="female" id="female"/>');

      core.storeInitialFormValues();

      let maleRadio = document.getElementById('male');
      let femaleRadio = document.getElementById('female');

      //Make sure radios are not dirty
      let isDirtyMale = core.isFormDirty(maleRadio);
      let isDirtyFemale = core.isFormDirty(femaleRadio);

      assert.isFalse(isDirtyMale);
      assert.isFalse(isDirtyFemale);

      //change the current value
      femaleRadio.click();

      //Make sure both radios are now dirty
      isDirtyMale = core.isFormDirty(maleRadio);
      isDirtyFemale = core.isFormDirty(femaleRadio);

      assert.isTrue(isDirtyMale);
      assert.isTrue(isDirtyFemale);

    });

    //Cant test out a file input
    it('should return dirty for a file input element passed in', function() {});

    after(function() {
      global.document = null;
    });

  });

  describe('#validate()', function() {

    it('should validate an input element passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      //Make sure its passes
      input.value = 'beans';
      var isValid = core.validate(input);
      assert.isTrue(isValid);

      //Make sure its fails
      input.value = 'bea3ns';
      isValid = core.validate(input);
      assert.isFalse(isValid);

    });

    it('should validate an input element in the document since nothing was passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      //Make sure its passes
      input.value = 'beans';
      var isValid = core.validate();
      assert.isTrue(isValid);

      //Make sure its fails
      input.value = 'bea3ns';
      isValid = core.validate();
      assert.isFalse(isValid);

    });

    it('should validate a select element passed in', function() {

      var select = document.createElement('select');
      select.setAttribute('required', '');

      var optionEmpty = document.createElement('option');
      var optionNonEmpty = document.createElement('option');

      optionEmpty.text = '';
      optionNonEmpty.text = 'Beans';

      select.appendChild(optionEmpty);
      select.appendChild(optionNonEmpty);

      //Make sure its fails
      select.options[0].selected = true;
      select.options[1].selected = false;
      var isValid = core.validate(select);
      assert.isFalse(isValid);

      //Make sure its passes
      select.options[0].selected = false;
      select.options[1].selected = true;
      isValid = core.validate(select);
      assert.isTrue(isValid);

    });

    it('should set an input element passed in with the attribute data-invalid equal to true', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      input.value = 'bean3s';
      core.validate(input);

      var hasDataInvalidAttr = input.getAttribute('data-invalid') === 'true';
      assert.isTrue(hasDataInvalidAttr);

    });

    it('should set an input element passed in with the attribute data-invalid equal to false', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      input.value = 'beans';
      core.validate(input);

      var dataInvalidAttr = input.getAttribute('data-invalid') === 'false';
      assert.isTrue(dataInvalidAttr);

    });

    it('should mark an input element passed in with a .has-error class because autoMarkInvalidFields is true', function() {

      core.initialize({
        autoMarkInvalidFields: true
      });

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      input.value = 'b3ans';
      core.validate(input);

      var hasHasErrorClass = input.classList.contains('has-error');
      assert.isTrue(hasHasErrorClass);

      //Reset the core options
      core.initialize({});

    });


    it('should not mark an input element passed in with a .has-error class because autoMarkInvalidFields is false', function() {

      core.initialize({
        autoMarkInvalidFields: false
      });

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      input.value = 'b3ans';
      core.validate(input);

      var hasHasErrorClass = input.classList.contains('has-error');
      assert.isFalse(hasHasErrorClass);

      //Reset the core options
      core.initialize({});

    });

    it('should add an error message label next to the input since autoShowErrorMessages is true', function() {

      core.initialize({
        autoShowErrorMessages: true
      });

      global.document = jsdom('<input type="text" class="alpha alpha-only" required/>');

      let input = document.getElementsByTagName('input')[0];

      //Check label does not exist
      var labelExists = input.nextElementSibling !== null;
      assert.isFalse(labelExists);

      core.validate(input);

      //Check label exists
      labelExists = input.nextElementSibling !== null;
      assert.isTrue(labelExists);

    });

    it('should not add a error message next to an input since autoShowErrorMessages is false', function() {

      core.initialize({
        autoShowErrorMessages: false
      });

      global.document = jsdom('<input type="text" class="alpha alpha-only" required/>');

      let input = document.getElementsByTagName('input')[0];

      //Check label does not exist
      var labelExists = input.nextElementSibling !== null;
      assert.isFalse(labelExists);

      core.validate(input);

      //Check label still does not exist
      labelExists = input.nextElementSibling !== null;
      assert.isFalse(labelExists);

    });

    it('should validate an invalid input element and use the messageCallback function passed in to display the error in the cool-div', function() {

      core.initialize({
        autoShowErrorMessages: true
      });

      global.document = jsdom('<div id="cool-div"></div>' +
        '<input type="text" class="alpha alpha-only" data-invalid="true" required/>');

      let input = document.getElementsByTagName('input')[0];
      input.value = 'bea3ns';

      core.validate(input, function(element, errorMessage) {
        let p = document.createElement('p');
        p.innerHTML = errorMessage;
        document.querySelector('#cool-div').appendChild(p);

        element.classList.add('its-wrong');
      });

      //Check if the cool-div div is empty
      var emptyCoolDiv = document.querySelector('#cool-div').innerHTML === '';
      assert.isFalse(emptyCoolDiv);

      let p = document.querySelector('p');

      expect(p.innerHTML).to.equal('Only letters, spaces, hypens, and periods are allowed');
      expect(input.classList.contains('its-wrong')).to.equal(true);

    });

    it('should validate a valid input element and use the messageCallback function passed in to remove the error in the cool-div', function() {

      core.initialize({
        autoShowErrorMessages: true
      });

      global.document = jsdom('<div id="cool-div"><span>Its invalid yo</span></div>' +
        '<input type="text" class="alpha alpha-only" data-invalid="false"/>');

      let coolDiv = document.querySelector('#cool-div');

      //Check if the cool-div div is not empty
      var emptyCoolDiv = coolDiv.innerHTML === '';
      assert.isFalse(emptyCoolDiv);

      let input = document.getElementsByTagName('input')[0];

      core.validate(input, function(element, errorMessage) {
        if (errorMessage === null) coolDiv.innerHTML = '';
      });

      //Check if the cool-div div is now empty
      emptyCoolDiv = coolDiv.innerHTML === '';
      assert.isTrue(emptyCoolDiv);

    });

    after(function() {
      global.document = null;
    });

  });

  describe('#getErrorMessage()', function() {

    it('should get the error message from an input', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="true" required/>');

      let input = document.getElementsByTagName('input')[0];

      let errorMessage = core.getErrorMessage(input);

      expect(errorMessage).to.equal('Only letters, spaces, hypens, and periods are allowed');

    });

    it('should should throw an error when nothing is passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="true" required/>');

      expect(function() {

        core.getErrorMessage();

      }).to.throw(Error);

    });

    it('should return null for a input that is not invalid', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="false"/>');

      let errorMessage = core.getErrorMessage('.alpha');

      expect(errorMessage).to.equal(null);

    });

    it('should return null for a input that does not exist', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="false"/>');

      let errorMessage = core.getErrorMessage('.beans');
      expect(errorMessage).to.equal(null);

    });

  });

  describe('#getErrorMessages()', function() {

    it('should get the error message from a single input', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="true" required/>');

      let input = document.getElementsByTagName('input')[0];
      let errorMessages = core.getErrorMessages(input);

      expect(errorMessages.length).to.equal(1);
      expect(errorMessages[0]).to.equal('Only letters, spaces, hypens, and periods are allowed');

    });

    it('should not throw an error and get all error messages when nothing is passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="true" required/>');

      let errorMessages = core.getErrorMessages();
      expect(errorMessages.length).to.equal(1);

    });

    it('should return and empty array for a input that is valid', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="false"/>');

      let errorMessages = core.getErrorMessages('.alpha');

      expect(errorMessages.length).to.equal(0);

    });

  });
  
  describe('#getErrorMessagesAsObjects()', function() {

    it('should get error message object array from a single input', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="true" required/>');

      let input = document.getElementsByTagName('input')[0];
      let errorMessageObjects = core.getErrorMessagesAsObjects(input);
      
      errorMessageObjects.should.have.lengthOf(1);
      expect(errorMessageObjects[0]['input']).to.equal(input);
      expect(errorMessageObjects[0]['errorMessage']).to.equal('Only letters, spaces, hypens, and periods are allowed');

    });

    it('should get an error message object array for muliple inputs', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="true" required/>' +
        '<input type="text" class="numeric numeric-whole" data-invalid="true" required/>');

      let errorMessageObjects = core.getErrorMessagesAsObjects('input');

      errorMessageObjects.should.have.lengthOf(2);

      let correctErrorMessageCount = 0;

      errorMessageObjects.forEach(function(errorMessageObject) {

        let errorMessage = errorMessageObject['errorMessage'];

        if (errorMessage === 'Only letters, spaces, hypens, and periods are allowed') correctErrorMessageCount++;
        if (errorMessage === 'Enter a whole number') correctErrorMessageCount++;

      });

      expect(correctErrorMessageCount).to.equal(2);

    });

    it('should return an empty array for an input that is valid', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="false"/>');

      let errorMessageObjects = core.getErrorMessagesAsObjects('input');

      errorMessageObjects.should.have.lengthOf(0);

    });

  });

  describe('#showErrorMessages()', function() {

    it('should add an error message label next to the input', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="true" required/>');

      let input = document.getElementsByTagName('input')[0];

      //Check label does not exist
      var labelExists = input.nextElementSibling !== null;
      assert.isFalse(labelExists);

      core.showErrorMessages(input);

      //Check label exists
      labelExists = input.nextElementSibling !== null;
      assert.isTrue(labelExists);

    });

    it('should remove an error message label that was put next to the input', function() {

      global.document = jsdom('<div><input type="text" class="alpha alpha-only" data-invalid="true" required/></div>');

      let input = document.getElementsByTagName('input')[0];

      //Check label does not exist
      var labelExists = input.nextElementSibling !== null;
      assert.isFalse(labelExists);

      core.showErrorMessages(input);

      //Check label exists
      labelExists = input.nextElementSibling !== null;
      assert.isTrue(labelExists);


      //Check label does not exist anymore
      input.setAttribute('data-invalid', false);
      core.showErrorMessages(input);

      labelExists = input.nextElementSibling !== null;

      assert.isFalse(labelExists);

    });

    it('should add an error message to a .form-group that had no .help-block when bootstrap 3 is being used', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      global.document = jsdom('<div class="form-group"><input type="text" class="alpha alpha-only" data-invalid="true" required/></div>');

      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //Check .help=block does not exist
      var helpBlockExists = formGroup.querySelector('.help-block') !== null;
      assert.isFalse(helpBlockExists);

      core.showErrorMessages(input);

      //Check .help=block does exist
      helpBlockExists = formGroup.querySelector('.help-block') !== null;
      assert.isTrue(helpBlockExists);

    });

    it('should add an error message to a .form-group that had no .form-text when bootstrap 4 is being used', function() {

      core.initialize({
        useBootstrap4Stlying: true
      });

      global.document = jsdom('<div class="form-group"><input type="text" class="alpha alpha-only" data-invalid="true" required/></div>');

      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //Check <small> does not exist
      var formTextExists = formGroup.querySelector('small') !== null;
      assert.isFalse(formTextExists);

      core.showErrorMessages(input);

      //Check <small> does exist
      formTextExists = formGroup.querySelector('small') !== null;
      assert.isTrue(formTextExists);

    });

    it('should add an error message to a the .col div in a form-horizontal when bootstrap 3 is being used', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      global.document = jsdom('<form class="form-horizontal">' +
                                '<div class="form-group">' +
                                  '<label>Cool Label</label>' +
                                  '<div class="col-xs-8">' +
                                    '<input type="text" class="alpha alpha-only" data-invalid="true" required/>' +
                                  '</div>' +
                                '</div>' +
                              '</form>');

      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //Check .help=block does not exist
      var colElements = formGroup.querySelectorAll('.col-xs-8 > *');
      assert.isTrue(colElements.length === 1);

      core.showErrorMessages(input);

      //Check .help=block does exist
      colElements = formGroup.querySelectorAll('.col-xs-8 > *');
      assert.isTrue(colElements.length === 2);

    });

    it('should not recieve an error message in a valid .form-froup with bootstrap 3', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      global.document = jsdom('<div class="form-group">' +
        '<input type="text" class="alpha alpha-only" data-invalid="false"/>' +
        '</div>');

      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //.help block should be there
      var helpBlockExists = formGroup.querySelector('.help-block') !== null;
      assert.isFalse(helpBlockExists);

      core.showErrorMessages(input);

      //.help block should have been removed
      helpBlockExists = formGroup.querySelector('.help-block') !== null;
      assert.isFalse(helpBlockExists);

    });

    it('should not recieve an error message in a valid .form-froup with bootstrap 4', function() {

      core.initialize({
        useBootstrap4Stlying: true
      });

      global.document = jsdom('<div class="form-group">' +
        '<input type="text" class="alpha alpha-only" data-invalid="false"/>' +
        '</div>');

      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //.help block should be there
      var formTextExists = formGroup.querySelector('.form-text') !== null;
      assert.isFalse(formTextExists);

      core.showErrorMessages(input);

      //.help block should have been removed
      formTextExists = formGroup.querySelector('.form-text') !== null;
      assert.isFalse(formTextExists);

    });

    it('should add a error message to a .form-group that already has a bootstrap 3 .help-block', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      global.document = jsdom('<div class="form-group">' +
        '<input type="text" class="alpha alpha-only" data-invalid="true" required/>' +
        '<span class="help-block"></span>' +
        '</div>');


      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //Make sure there is a help block but no ritsu-error <b>
      var helpBlockExists = formGroup.querySelectorAll('.help-block').length === 1;
      var ritsuErrorExists = formGroup.querySelectorAll('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isFalse(ritsuErrorExists);

      core.showErrorMessages(input);

      //Make sure there is a help block and a ritsu-error <b>
      helpBlockExists = formGroup.querySelectorAll('.help-block').length === 1;
      ritsuErrorExists = formGroup.querySelectorAll('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isTrue(ritsuErrorExists);

    });

    it('should add a error message to a .form-group that already has a bootstrap 4 .form-text', function() {

      core.initialize({
        useBootstrap4Stlying: true
      });

      global.document = jsdom('<div class="form-group">' +
        '<input type="text" class="alpha alpha-only" data-invalid="true" required/>' +
        '<small class="form-text"></small>' +
        '</div>');


      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //Make sure there is a help block but no ritsu-error <b>
      var formTextExists = formGroup.querySelectorAll('.form-text').length === 1;
      var ritsuErrorExists = formGroup.querySelectorAll('.ritsu-error').length > 0;
      assert.isTrue(formTextExists);
      assert.isFalse(ritsuErrorExists);

      core.showErrorMessages(input);

      //Make sure there is a help block and a ritsu-error <b>
      formTextExists = formGroup.querySelectorAll('.form-text').length === 1;
      ritsuErrorExists = formGroup.querySelectorAll('.ritsu-error').length > 0;
      assert.isTrue(formTextExists);
      assert.isTrue(ritsuErrorExists);

    });

    it('should remove a error message from a .form-group that already had a bootstrap 3 .help-block', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      global.document = jsdom('<div class="form-group">' +
        '<input type="text" class="alpha alpha-only" data-invalid="false"/>' +
        '<span class="help-block">' +
        '<b class="ritsu-error"><em>You goofed</em></b><br class="ritsu-error">' +
        '</span>' +
        '</div>');

      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //Make sure there is a help block and a ritsu-error <b>
      var helpBlockExists = formGroup.querySelectorAll('.help-block').length === 1;
      var ritsuErrorExists = formGroup.querySelectorAll('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isTrue(ritsuErrorExists);

      core.showErrorMessages(input);

      //Make sure there is a help block still but the ritsu-error <b> gone
      helpBlockExists = formGroup.querySelectorAll('.help-block').length === 1;
      ritsuErrorExists = formGroup.querySelectorAll('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isFalse(ritsuErrorExists);

    });

    it('should remove a error message from a .form-group that already had a bootstrap 4 .form-text', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      global.document = jsdom('<div class="form-group">' +
        '<input type="text" class="alpha alpha-only" data-invalid="false"/>' +
        '<small class="form-text">' +
        '<b class="ritsu-error"><em>You goofed</em></b><br class="ritsu-error">' +
        '</small>' +
        '</div>');

      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //Make sure there is a help block and a ritsu-error <b>
      var formTextExists = formGroup.querySelectorAll('.form-text').length === 1;
      var ritsuErrorExists = formGroup.querySelectorAll('.ritsu-error').length > 0;
      assert.isTrue(formTextExists);
      assert.isTrue(ritsuErrorExists);

      core.showErrorMessages(input);

      //Make sure there is a help block still but the ritsu-error <b> gone
      formTextExists = formGroup.querySelectorAll('.form-text').length === 1;
      ritsuErrorExists = formGroup.querySelectorAll('.ritsu-error').length > 0;
      assert.isTrue(formTextExists);
      assert.isFalse(ritsuErrorExists);

    });

    it('should add an error message into the cool div with a messageCallback set in ritsu', function() {

      global.document = jsdom('<div id="cool-div"></div>' +
        '<input type="text" class="alpha alpha-only" data-invalid="true" required/>');

      let coolDiv = document.getElementById('cool-div');
      let input = document.getElementsByTagName('input')[0];

      //Check label does not exist
      var emptyCoolDiv = coolDiv.innerHTML === '';
      assert.isTrue(emptyCoolDiv);

      core.initialize({
        messageCallback: function(element, errorMessage) {
          var hasErrorMessage = errorMessage !== null;
          if (hasErrorMessage) document.getElementById('cool-div').innerHTML += errorMessage;
        }
      }).showErrorMessages(input);

      //Check label exists
      emptyCoolDiv = coolDiv.innerHTML === '';
      assert.isFalse(emptyCoolDiv);

    });

    it('should remove an error message into the cool div with a messageCallback set in ritsu', function() {

      global.document = jsdom('<div id="cool-div">' +
        '<label for="cool-input"></label>' +
        '</div>' +
        '<input type="text" class="alpha alpha-only" data-invalid="false" name="cool-input"/>');

      let coolDiv = document.getElementById('cool-div');
      let input = document.getElementsByTagName('input')[0];

      //Check label does not exist
      var emptyCoolDiv = coolDiv.innerHTML === '';
      assert.isFalse(emptyCoolDiv);

      core.initialize({
        messageCallback: function(element, errorMessage) {

          let coolDiv = document.getElementById('cool-div');

          var hasErrorMessage = errorMessage !== null;
          if (hasErrorMessage)
            coolDiv.innerHTML += errorMessage;
          else {
            let errorLabel = coolDiv.querySelector('label[for="' + element.getAttribute('name') + '"]');
            coolDiv.removeChild(errorLabel);
          }

        }
      }).showErrorMessages(input);

      //Check label exists
      emptyCoolDiv = coolDiv.innerHTML === '';
      assert.isTrue(emptyCoolDiv);

    });

    it('should add an error message into the cool div with a messageCallback passed in', function() {

      global.document = jsdom('<div id="cool-div"></div>' +
        '<input type="text" class="alpha alpha-only" data-invalid="true" required/>');

      let coolDiv = document.getElementById('cool-div');
      let input = document.getElementsByTagName('input')[0];

      //Check label does not exist
      var emptyCoolDiv = coolDiv.innerHTML === '';
      assert.isTrue(emptyCoolDiv);

      core.showErrorMessages(input, function(element, errorMessage) {

        var hasErrorMessage = errorMessage !== null;
        if (hasErrorMessage) document.getElementById('cool-div').innerHTML += errorMessage;

      });

      //Check label exists
      emptyCoolDiv = coolDiv.innerHTML === '';
      assert.isFalse(emptyCoolDiv);

    });

    it('should remove an error message from the cool div with a messageCallback passed in', function() {

      global.document = jsdom('<div id="cool-div">' +
        '<label for="cool-input"></label>' +
        '</div>' +
        '<input type="text" class="alpha alpha-only" data-invalid="false" name="cool-input"/>');

      let coolDiv = document.getElementById('cool-div');
      let input = document.getElementsByTagName('input')[0];

      //Check label does not exist
      var emptyCoolDiv = coolDiv.innerHTML === '';
      assert.isFalse(emptyCoolDiv);

      core.showErrorMessages(input, function(element, errorMessage) {

        let coolDiv = document.getElementById('cool-div');

        var hasErrorMessage = errorMessage !== null;
        if (hasErrorMessage)
          coolDiv.innerHTML += errorMessage;
        else {
          let errorLabel = coolDiv.querySelector('label[for="' + element.getAttribute('name') + '"]');
          coolDiv.removeChild(errorLabel);
        }

      });

      //Check label exists
      emptyCoolDiv = coolDiv.innerHTML === '';
      assert.isTrue(emptyCoolDiv);

    });

    it('should not throw an exception when using bootstrap 3 and validating an input not in a .form-group', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      global.document = jsdom('<div>' +
        '<input type="text" class="alpha alpha-only" data-invalid="true"/>' +
        '</div>');

      let input = document.getElementsByTagName('input')[0];

      //Make sure there is a help block and a ritsu-error <b>

      core.showErrorMessages(input);

    });

    afterEach(function() {
      core.initialize({});
    });

  });


  describe('#markInvalidFields()', function() {

    it('should mark an input element passed in with a .has-error class', function() {

      core.initialize({
        autoMarkInvalidFields: true
      });

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="b3ans"/>');

      let input = document.getElementsByTagName('input')[0];

      core.validate(input);

      var hasHasErrorClass = input.classList.contains('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    it('should mark an input element with a .has-error class when nothing is passed in', function() {

      core.initialize({
        autoMarkInvalidFields: true
      });

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="b3ans"/>');

      let input = document.getElementsByTagName('input')[0];

      //Make sure there is no class
      var hasHasErrorClass = input.classList.contains('has-error');
      assert.isFalse(hasHasErrorClass);

      core.validate();

      //Make sure there is a class
      hasHasErrorClass = input.classList.contains('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    it('should mark a .form-group element with a .has-error class when useBootstrap3Stlying = true', function() {

      core.initialize({
        useBootstrap3Stlying: true,
        autoMarkInvalidFields: true
      });

      global.document = jsdom('<div class="form-group"><input type="text" class="alpha alpha-only" value="b3ans"/></div>');

      let formGroup = document.getElementsByTagName('div')[0];

      //Make sure there is no class
      var hasHasErrorClass = formGroup.classList.contains('has-error');
      assert.isFalse(hasHasErrorClass);

      core.validate(formGroup);

      //Make sure there is a class
      hasHasErrorClass = formGroup.classList.contains('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    it('should mark an input element with a .has-error class when useBootstrap3Stlying = true and is not in a form group', function() {

      core.initialize({
        useBootstrap3Stlying: true,
        autoMarkInvalidFields: true 
      });

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="b3ans"/>');

      let input = document.getElementsByTagName('input')[0];

      //Make sure there is no class
      var hasHasErrorClass = input.classList.contains('has-error');
      assert.isFalse(hasHasErrorClass);

      core.validate(input);

      //Make sure there is a class
      hasHasErrorClass = input.classList.contains('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    afterEach(function() {
      core.initialize({});
    });

  });

  describe('#_getSelectorAsElementArray()', function() {

    it('should return an empty array if no form elements are found', function() {

      global.document = jsdom('<p>No form elements here boss</p>');

      let elementArray = core.mocha_getSelectorAsElementArray('input');

      expect(elementArray).to.have.lengthOf(0);

    });

    it('should return an array of one element of which was passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="norf"/>');

      let input = document.querySelector('input');
      let elementArray = core.mocha_getSelectorAsElementArray(input);

      expect(elementArray).to.have.lengthOf(1);
      expect(elementArray[0]).to.equal(input);

    });

    it('should return an array of one element with a css selector string passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="norf"/>');

      let input = document.querySelector('input');
      let elementArray = core.mocha_getSelectorAsElementArray('.alpha');

      expect(elementArray).to.have.lengthOf(1);
      expect(elementArray[0]).to.equal(input);

    });

    it('should return an array of one element from a jQuery element passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="norf"/>');

      global.jQuery = require('jquery')(document.defaultView); //need global for the jQueryIsPresent variable in core js

      let input = document.getElementsByTagName('input')[0];
      let elementArray = core.mocha_getSelectorAsElementArray(jQuery(input));

      expect(elementArray).to.have.lengthOf(1);
      expect(elementArray[0]).to.equal(input);

    });

    it('should return an array of all 3 elements on the document since nothing was passed in', function() {

      global.document = jsdom(
        '<input type="text" class="alpha alpha-only" value="norf"/>' + '<select></select>' + '<textarea></textarea>'
      );

      let elementArray = core.mocha_getSelectorAsElementArray();

      expect(elementArray).to.have.lengthOf(3);

    });

    it('should return an array of all 2 elements in the div container of which was passed in', function() {

      global.document = jsdom('<input/>' + '<input/>');

      let div = document.getElementsByTagName('div')[0];
      let elementArray = core.mocha_getSelectorAsElementArray(div);

      expect(elementArray).to.have.lengthOf(2);

    });

    it('should return the same array of elements passed in', function() {

      global.document = jsdom('<input/>' + '<textarea></textarea>');

      let inputArray = [document.querySelector('input'), document.querySelector('textarea')];
      let elementArray = core.mocha_getSelectorAsElementArray(inputArray);

      expect(elementArray).to.have.lengthOf(2);

    });

    it('should return an array of 2 elements from a NodeList passed in', function() {

      global.document = jsdom('<input/>' + '<input/>');

      let inputs = document.querySelectorAll('input');
      let elementArray = core.mocha_getSelectorAsElementArray(inputs);

      expect(elementArray).to.have.lengthOf(2);

    });

    it('should return an array of 2 elements from a HTMLCollection passed in', function() {

      global.document = jsdom('<input/>' + '<input/>');

      let inputs = document.getElementsByTagName('input');
      let elementArray = core.mocha_getSelectorAsElementArray(inputs);

      expect(elementArray).to.have.lengthOf(2);

    });

    it('should return an array of 2 elements from two diffrent containers passed in', function() {

      global.document = jsdom('<div id="1"><input/></div>' + '<div id="2"><input/></div>');

      let div1 = document.getElementById('1');
      let div2 = document.getElementById('2');
      let elementArray = core.mocha_getSelectorAsElementArray([div1, div2]);

      expect(elementArray).to.have.lengthOf(2);

    });

    it('should return an array of 3 elements from a css string selector of a container and an input', function() {

      global.document = jsdom('<div><input/><input/></div>' + '<input class="lonely-driver"/>');

      let elementArray = core.mocha_getSelectorAsElementArray('div, .lonely-driver');

      expect(elementArray).to.have.lengthOf(3);

    });

  });

  after(function() {
    delete global.document;
    delete global.jQuery;
  });

});
