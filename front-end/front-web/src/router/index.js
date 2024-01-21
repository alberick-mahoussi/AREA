import Vue from 'vue'
import Router from 'vue-router'
import WelcomePage from '@/views/WelcomePage'
import LoginPage from '@/views/LoginPage'
import RegisterPage from '@/views/RegisterPage'
import CreatePage from '@/views/CreatePage'
import ApkPage from '@/views/ApkPage'
import ChooseServicesPage from '@/views/ChooseServicesPage'
import ChooseActionsPage from '@/views/ChooseActionsPage'
import ManageAreaPage from '@/views/ManageAreaPage'
import ConfirmActionPage from '@/views/ConfirmActionPage'
import ProfilePage from '@/views/ProfilePage'
import EditServicesPage from '@/views/EditServicesPage'
import ForgotPasswordPage from '@/views/ForgotPasswordPage'
import GoogleCallbackPage from '@/views/GoogleCallbackPage'
import GithubCallbackPage from '@/views/service/GithubCallbackPage'
import OutlookCallbackPage from '@/views/OutlookCallbackPage'
import GoogleAuthCallbackPage from '@/views/service/GoogleAuthCallbackPage'
import OutlookAuthCallbackPage from '@/views/service/OutlookAuthCallbackPage'
import GitlabCallbackPage from '@/views/service/GitlabCallbackPage'
import NotionCallbackPage from '@/views/service/NotionCallbackPage'
import SpotifyCallbackPage from '@/views/service/SpotifyCallbackPage'
import DiscordCallbackPage from '@/views/service/DiscordCallbackPage'
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'WelcomePage',
      component: WelcomePage,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) {
          next('/create')
        } else {
          next()
        }
      }
    },
    {
      path: '/login',
      name: 'LoginPage',
      component: LoginPage,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) {
          next('/create')
        } else {
          next()
        }
      }
    },
    {
      path: '/register',
      name: 'RegisterPage',
      component: RegisterPage,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) {
          next('/create')
        } else {
          next()
        }
      }
    },
    {
      path: '/client.apk',
      name: 'ApkPage',
      component: ApkPage
    },
    {
      path: '/google',
      name: 'GoogleCallbackPage',
      component: GoogleCallbackPage
    },
    {
      path: '/github',
      name: 'GithubCallbackPage',
      component: GithubCallbackPage
    },
    {
      path: '/microsoft',
      name: 'OutlookCallbackPage',
      component: OutlookCallbackPage
    },
    {
      path: '/outlook',
      name: 'OutlookAuthCallbackPage',
      component: OutlookAuthCallbackPage
    },
    {
      path: '/gmail',
      name: 'GoogleAuthCallbackPage',
      component: GoogleAuthCallbackPage
    },
    {
      path: '/forgotPassword',
      name: 'ForgotPasswordPage',
      component: ForgotPasswordPage
    },
    {
      path: '/gitlab',
      name: 'GitlabCallbackPage',
      component: GitlabCallbackPage
    },
    {
      path: '/notion',
      name: 'NotionCallbackPage',
      component: NotionCallbackPage
    },
    {
      path: '/create',
      name: 'CreatePage',
      component: CreatePage,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) {
          next()
        } else {
          next('/')
        }
      }
    },
    {
      path: '/spotify',
      name: 'SpotifyCallbackPage',
      component: SpotifyCallbackPage
    },
    {
      path: '/services',
      name: 'ChooseServicesPage',
      component: ChooseServicesPage,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) {
          next()
        } else {
          next('/')
        }
      }
    },
    {
      path: '/actions/:serviceIndex',
      name: 'ChooseActionsPage',
      component: ChooseActionsPage,
      props: true,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) {
          next()
        } else {
          next('/')
        }
      }
    },
    {
      path: '/manage',
      name: 'ManageAreaPage',
      component: ManageAreaPage,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) {
          next()
        } else {
          next('/')
        }
      }
    },
    {
      path: '/discord',
      name: DiscordCallbackPage,
      component: DiscordCallbackPage
    },
    {
      path: '/actions/:serviceIndex/confirm/:actionIndex',
      name: 'ConfirmActionPage',
      component: ConfirmActionPage,
      props: true,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) {
          next()
        } else {
          next('/')
        }
      }
    },
    {
      path: '/profile',
      name: 'ProfilePage',
      component: ProfilePage,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) {
          next()
        } else {
          next('/')
        }
      }
    },
    {
      path: '/edit-services',
      name: 'EditServicesPage',
      component: EditServicesPage,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) {
          next()
        } else {
          next('/')
        }
      }
    }
  ]
})
