var mandrill = require('mandrill-api/mandrill');

var MandrillAdapter = mandrillOptions => {
  if (
      !mandrillOptions ||
      !mandrillOptions.apiKey ||
      !mandrillOptions.fromEmail
  ) {
    throw 'MandrillAdapter requires an API Key and a From Email Address.';
  }

  // If a verification template slug is supplied, we'll send mail using that,
  // otherwise use the supplied subject/body
  if(!mandrillOptions.verificationTemplate) {
      mandrillOptions.verificationSubject = mandrillOptions.verificationSubject ||
        'Please verify your e-mail for *|appname|*';
      mandrillOptions.verificationBody = mandrillOptions.verificationBody ||
        'Hi,\n\nYou are being asked to confirm the e-mail address *|email|* ' +
        'with *|appname|*\n\nClick here to confirm it:\n*|link|*';
  }

  // If a password reset template slug is supplied, we'll send mail using that,
  // otherwise use the supplied subject/body
  if(!mandrillOptions.passwordResetTemplate) {
      mandrillOptions.passwordResetSubject = mandrillOptions.passwordResetSubject ||
        'Password Reset Request for *|appname|*';
      mandrillOptions.passwordResetBody = mandrillOptions.passwordResetBody ||
        'Hi,\n\nYou requested a password reset for *|appname|*.\n\nClick here ' +
        'to reset it:\n*|link|*';
  }

  mandrillOptions.replyTo =
      mandrillOptions.replyTo ||
      mandrillOptions.fromEmail;
  mandrillOptions.displayName =
      mandrillOptions.displayName ||
      mandrillOptions.replyTo;

  var mandrill_client = new mandrill.Mandrill(mandrillOptions.apiKey);

  var sendVerificationEmail = options => {
    var message = {
      from_email: mandrillOptions.fromEmail,
      from_name: mandrillOptions.displayName,
      headers: {
        'Reply-To': mandrillOptions.replyTo
      },
      to: [{
        email: options.user.get("email")
      }],
      global_merge_vars: [
        { name: 'appname', content: options.appName},
        { name: 'name', content: options.user.get("name")},
        { name: 'email', content: options.user.get("email")},
        { name: 'link', content: options.link}
      ]
    };

    console.log(options.link);

    if (!mandrillOptions.verificationTemplate) {
      message.subject = mandrillOptions.verificationSubject;
      message.text = mandrillOptions.verificationBody;
    }

    return new Promise((resolve, reject) => {
      if(mandrillOptions.verificationTemplate) {
        mandrill_client.messages.sendTemplate(
          {
            template_name: mandrillOptions.verificationTemplate,
            template_content: [],
            message: message,
            async: true
          },
          resolve,
          reject
        );
      }
      else {
        mandrill_client.messages.send(
          {
            message: message,
            async: true
          },
          resolve,
          reject
        );
      }
    });
  };

  var sendPasswordResetEmail = options => {
    var message = {
      from_email: mandrillOptions.fromEmail,
      from_name: mandrillOptions.displayName,
      headers: {
        'Reply-To': mandrillOptions.replyTo
      },
      to: [{
        email: options.user.get("email")
      }],
      global_merge_vars: [
        { name: 'appname', content: options.appName},
        { name: 'firstname', content: options.user.get("first_name")},
        { name: 'email', content: options.user.get("email")},
        { name: 'link', content: options.link}
      ]
    };

    if (!mandrillOptions.passwordResetTemplate) {
      message.subject = mandrillOptions.passwordResetSubject;
      message.text = mandrillOptions.passwordResetBody;
    }

    return new Promise((resolve, reject) => {

      if(mandrillOptions.passwordResetTemplate) {
        mandrill_client.messages.sendTemplate(
          {
            template_name: mandrillOptions.passwordResetTemplate,
            template_content: [],
            message: message,
            async: true
          },
          resolve,
          reject
        );
      }
      else {
        mandrill_client.messages.send(
          {
            message: message,
            async: true
          },
          resolve,
          reject
        );
      }
  
    });
  };

  var sendMail = options => {
    var message = {
      from_email: mandrillOptions.fromEmail,
      from_name: mandrillOptions.displayName,
      headers: {
        'Reply-To': mandrillOptions.replyTo
      },
      to: [{
        email: options.to
      }],
      subject: options.subject,
      text: options.text
    };

    return new Promise((resolve, reject) => {
      mandrill_client.messages.send(
        {
          message: message,
          async: true
        },
        resolve,
        reject
      );
  });
};

  return Object.freeze({
    sendVerificationEmail: sendVerificationEmail,
    sendPasswordResetEmail: sendPasswordResetEmail,
    sendMail: sendMail
  });
};

module.exports = MandrillAdapter;
