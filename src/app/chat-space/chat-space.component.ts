import { Component } from '@angular/core';
import { environment } from '.././../environments/environment'
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Database, getDatabase, ref, set, onValue  } from "firebase/database";
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '../chat/chat';
import { AuthService } from '../shared/services/auth.service';
@Component({
  selector: 'app-chat-space',
  templateUrl: './chat-space.component.html',
  styleUrls: ['./chat-space.component.scss']
})
export class ChatSpaceComponent {
  app: FirebaseApp;
  db: Database;
  form: FormGroup;
  username = '';
  userData: any;

  exactUser:any;
  message = '';
  chats: Chat[] = [];
  constructor(private formBuilder: FormBuilder,public authService: AuthService) {
    this.app = initializeApp(environment.firebase);
    this.db = getDatabase(this.app);

    this.form = this.formBuilder.group({
      'message' : [],
      'username' : ''
    });
    this.form.controls['username'].setValue(this.exactUser);
  }
  onChatSubmit(form: any) {
    const chat = form;
    chat.timestamp = new Date().toString();
    chat.id = uuidv4();
    set(ref(this.db, `chats/${chat.id}`), chat);
    this.form = this.formBuilder.group({
      'message' : [],
      'username' : this,
    });
  }
  ngOnInit(): void {

    this.authService.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
   this.exactUser = this.userData.multiFactor.user.email;
   this.form.controls['username'].setValue(this.exactUser);

        console.log(this.userData.multiFactor.user);
        
      } else {
        // Handle the case when the user logs out
        this.userData = null;
      }
    });
  

    const chatsRef = ref(this.db, 'chats');
    onValue(chatsRef, (snapshot: any) => {
      const data = snapshot.val();
      for(let id in data) {
        if (!this.chats.map(chat => chat.id).includes(id)) {
          this.chats.push(data[id])
        }
      }
    })


  }
}