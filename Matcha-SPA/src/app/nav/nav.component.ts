import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';
import { User } from 'src/app/_models/user';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  photoUrl: string;
  unread: number = 0;
  user: User;
  flag: number = 0;

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private alertify: AlertifyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
  }

  login() {
    this.authService.login(this.model).subscribe(
      next => {
        this.alertify.success('Logged in successfully');
      },
      error => {
        this.alertify.error(error);
      },
      () => {
        if (localStorage.getItem('reportedlist')) {
          if (localStorage.getItem('reportedlist') === this.authService.currentUser.id.toString()) {
            this.flag = 1;
            this.userService.getUser(this.authService.currentUser.id).subscribe(
              data => {
                this.user = data;
                this.user.deactivated = 1;
                this.userService.updateUser(this.authService.currentUser.id, this.user);
                this.alertify.error('Your profile has been reported as fake and deactivated, please contact an admin if this was done in error at murraylydie@gmail.com');
                this.logout();
              },
              error => {
                console.log('You done fucked up');
              }
            );
          }
        }
        if (this.authService.currentUser.deactivated === 1) {
          this.alertify.error('Your profile has been reported as fake and deactivated, please contact an admin if this was done in error at murraylydie@gmail.com');
          this.logout();
        }
        this.router.navigate(['/members']);
      }
    );
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authService.decodedToken = null;
    this.authService.currentUser = null;
    this.alertify.message('logged out');
    this.router.navigate(['/home']);
  }
}
