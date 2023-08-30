document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detailed-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = event => {
    event.preventDefault(); //this prevents page from refreshing. Otherwise fetch won't work.
    send_mail();
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detailed-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  mail_preview(mailbox);
}

function send_mail() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
  })
  .then(load_mailbox('sent'));
}

function mail_preview(mailbox) {
  let path = '/emails/';
  path = path.concat(mailbox);
  fetch(path)
  .then(response => response.json())
  .then(result => {
    result.forEach(element => {
      const element_div = document.createElement('div');
      const sender = document.createElement('p');
      sender.style = `
        font-weight: bold;
        margin-right: 10px;
      `;
      const subject = document.createElement('p');
      const time = document.createElement('p');
      time.style = `
        font-weight: 100;
        margin-left: auto;
      `;
      sender.innerHTML = element.sender;
      subject.innerHTML = element.subject;
      time.innerHTML = element.timestamp;
      element_div.appendChild(sender);
      element_div.appendChild(subject);
      element_div.appendChild(time);
      element_div.style = `
        border: solid black 1px;
        display: flex;
      `
      element_div.addEventListener('click', () => detailed_view(element));
      document.querySelector('#emails-view').append(element_div);
    });
  });
}

function detailed_view(element) {
  let mail_id = element.id.toString();
  let path = '/emails/';
  path = path.concat(mail_id);
  fetch(path)
  .then(response => response.json())
  .then(result => {
    console.log(result);
    let all_receipients = String();
    result.recipients.forEach(recipient => {
      all_receipients = all_receipients.concat(recipient);
    })
    const head_content = document.createElement('ul');
    head_content.setAttribute('class', 'list-unstyled')
    head_content.innerHTML = `
      <li><strong>From: </strong>${result.sender}</li>
      <li><strong>To: </strong>${all_receipients}</li>
      <li><strong>Subject: </strong>${result.subject}</li>
      <li><strong>Timestamp: </strong>${result.timestamp}</li>
      <hr>
    `;
    const mail_content = document.createElement('p');
    mail_content.innerHTML = result.body;
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#detailed-view').style.display = 'block';
    //for removing previously loaded mail
    while(document.querySelector('#detailed-view').firstChild)
      document.querySelector('#detailed-view').removeChild(document.querySelector('#detailed-view').firstChild);
    document.querySelector('#detailed-view').appendChild(head_content);
    document.querySelector('#detailed-view').appendChild(mail_content);

    fetch(path, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
    .then(response => {console.log(response)});
  });
}