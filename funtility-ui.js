class FuntilityUI
{
    constructor(funtilityApi)
    {
        if(funtilityApi === null) throw "FuntilityUI requires an instance of the FuntilityAPI."
        this.api = funtilityApi
        this.form = {}
        this.senderEmail = ""
        this.init()
    }

    //#region Initialize

    init()
    {
        this.initMessageCenter()
        let divider = document.createElement('span')
        divider.innerText = ' | '
        
        if (this.api.userIsSignedIn)
        {
            this.funtilityElement([this.userNameButton,divider,this.signOutButon])
        } else {
            this.funtilityElement([this.signInButton,divider,this.signUpButton])
        }
    }

    funtilityElement(childElements = [])
    {
        let div = document.createElement('div')
        childElements.forEach(ele => div.appendChild(ele))

        let ele = document.getElementById('funtility')
        ele.innerHTML = null
        ele.appendChild(div)
    }

    get userNameButton()
    {
        let span = document.createElement('span')
        span.classList.add('fnt-hover')
        span.innerText = this.api.state.userName
        span.addEventListener('click', () => {
            this.showModal(this.AccountContainer, ModalCloseMode.EASY)
        })
        return span
    }

    get signOutButon()
    {
        let span = document.createElement('span')
        span.classList.add('fnt-hover')
        span.innerText = 'Sign Out'
        span.addEventListener('click', () => {
            if(confirm("Are you sure you want to sign out?"))
            {
                this.api.signOut()
                location.reload()
            }
        })
        return span
    }

    get signInButton()
    {
        let span = document.createElement('span')
        span.classList.add('fnt-hover')
        span.innerText = 'Sign In'
        span.addEventListener('click', () => { this.showModal(this.SignInContainer) })
        return span
    }

    get signUpButton()
    {
        let span = document.createElement('span')
        span.classList.add('fnt-hover')
        span.innerText = 'Sign Up'
        span.addEventListener('click', () => { this.showModal(this.SignUpContainer) })
        return span
    }

    //#endregion

    //#region FORM: Sign Up

    get SignUpContainer()
    {
        this.resetAll()

        let hdr = document.createElement('div')
        hdr.classList.add('xlg')
        hdr.innerText = 'Sign Up For'
        
        let app = document.createElement('div')
        app.classList.add('xlg')
        app.classList.add('bold')
        app.innerText = this.api.appName

        let br = document.createElement('br')
        br.classList.add('fnt-hgt-20')

        let inEmail = document.createElement('input')
        inEmail.setAttribute('type','email')
        inEmail.placeholder = 'Email'
        inEmail.id = 'email'
        inEmail.classList.add('fnt-input')
        inEmail.classList.add('fnt-wid-200')

        let iVal1 = document.createElement('div')
        iVal1.id = 'emailValid'
        iVal1.classList.add('fnt-hgt-20')

        let inUser = document.createElement('input')
        inUser.setAttribute('type','text')
        inUser.placeholder = 'User Name'
        inUser.id = 'username'
        inUser.classList.add('fnt-input')
        inUser.classList.add('fnt-wid-200')

        let iVal2 = document.createElement('div')
        iVal2.id = 'usernameValid'
        iVal2.classList.add('fnt-hgt-20')

        let btn = document.createElement('button')
        btn.id = 'signUpFormButton'
        btn.classList.add('fnt-button')
        btn.classList.add('fnt-wid-200')
        btn.classList.add('xxlg')
        btn.classList.add('tx-ctr')
        btn.innerText = 'Submit'
        btn.addEventListener('click', () => { this.requestAccount() })

        return this.generateFormContainer([hdr,app,br,inEmail,iVal1,inUser,iVal2,btn])
    }

    requestAccount()
    {
        let form = this.signUpForm
        if (form.isValid())
        {
            this.showModal(this.ProcessingContainer, ModalCloseMode.PROGRAMMATIC)
            this.api.POST_Account(form.email,form.username)
            .then((res) => {
                if(res.errors.length > 0) {
                    this.deleteModal()
                    res.errors.forEach((err) => {
                        this.showEphemeralMessage('fnt-msg-cntr',this.messageType.ERROR,err)
                    })
                } else {
                    this.showModal(this.SignInContainer)
                }
            })
        }
    }

    get signUpForm()
    {
        let email = this.getInputValue('email')
        let username = this.getInputValue('username')
        if(username === null) username == ''
        username = username.trim()

        let isValid = () => {
            let result = true
            if (!this.isValidEmail(email)) {
                result = false
                if (document.getElementById('emailValid').childElementCount === 0)
                {
                    this.showEphemeralMessage('emailValid',this.messageType.ERROR,'Invalid Email')
                }
            }
            if (username === '') {
                result = false
                if (document.getElementById('usernameValid').childElementCount === 0)
                {
                    this.showEphemeralMessage('usernameValid',this.messageType.ERROR,'User Name is required.')
                }
            }
            return result
        }

        return {
            'email': email,
            'username': username,
            'isValid': isValid
        }
    }

    //#endregion

    //#region FORM: Sign In

    get SignInContainer()
    {
        let hdr = document.createElement('div')
        hdr.innerText = 'Sign In to'
        hdr.classList.add('xlg')
        
        let app = document.createElement('div')
        app.innerText = this.api.appName
        app.classList.add('xlg')
        app.classList.add('bold')
        
        let info = document.createElement('div')
        info.innerText = "We'll email a sign in code."

        let inp = document.createElement('input')
        inp.setAttribute('type','email')
        inp.id = 'email'
        inp.classList.add('fnt-input')
        inp.classList.add('fnt-wid-200')
        inp.placeholder = 'Email'
        inp.value = this.api.savedEmail

        let iVal = document.createElement('div')
        iVal.id = 'emailValid'
        iVal.classList.add('fnt-hgt-20')

        let btn = document.createElement('button')
        btn.id = 'signInFormButton'
        btn.innerText = 'Continue'
        btn.classList.add('fnt-button')
        btn.classList.add('fnt-wid-200')
        btn.classList.add('xxlg')
        btn.classList.add('tx-ctr')
        btn.addEventListener('click', () => { this.requestSignInCode(email) })
        
        let skip = document.createElement('a')
        skip.innerText = 'I already have a code.'
        skip.classList.add('fnt-have-code')
        skip.addEventListener('click', () => { this.showModal(this.EnterCodeContainer) })

        return this.generateFormContainer([hdr,app,info,inp,iVal,btn,skip])
    }

    requestSignInCode()
    {
        let form = this.signInForm
        if (form.isValid())
        {
            this.showModal(this.ProcessingContainer, ModalCloseMode.PROGRAMMATIC)
            this.api.GET_LoginCode(form.email)
            .then((res) => {
                this.deleteModal()
                if(res.errors.length > 0) {
                    res.errors.forEach((err) => {
                        this.showEphemeralMessage('fnt-msg-cntr',this.messageType.ERROR,err, 10000)
                    })
                } else {
                    this.form = res.result
                    if (this.api.userIsSignedIn) {
                        location.reload()
                    } else {
                        this.showModal(this.EnterCodeContainer)
                    }
                }
            })
        }
    }

    get signInForm()
    {
        let email = this.getInputValue('email')

        let isValid = () => {
            let result = true
            if (!this.isValidEmail(email)) {
                result = false
                if (document.getElementById('emailValid').childElementCount === 0)
                {
                    this.showEphemeralMessage('emailValid',this.messageType.ERROR,'Invalid Email')
                }
            }
            return result
        }

        return {
            'email': email,
            'isValid': isValid
        }
    }

    //#endregion

    //#region FORM: Enter Code

    get EnterCodeContainer()
    {
        let hdr = document.createElement('div')
        hdr.classList.add('bold')
        hdr.classList.add('xlg')
        hdr.innerText = 'Enter the code'
        
        let info = document.createElement('p')
        info.classList.add('sm')
        info.innerText = 'If that email address exists in our system, ' +
            'you should recieve an email with a code to sign in.'
        
        let inp = document.createElement('input')
        inp.id = 'code'
        inp.classList.add('fnt-input')
        inp.classList.add('fnt-wid-200')
        inp.classList.add('xxlg')
        inp.classList.add('tx-ctr')
        inp.placeholder = 'Code'
        
        let iVal = document.createElement('div')
        iVal.id = 'codeValid'
        iVal.classList.add('fnt-hgt-20')
        
        let btn = document.createElement('button')
        btn.id = 'enterCodeButton'
        btn.classList.add('fnt-button')
        btn.classList.add('fnt-wid-200')
        btn.classList.add('xxlg')
        btn.classList.add('tx-ctr')
        btn.innerText = 'Submit'
        btn.addEventListener('click', () => { this.requestAuthentication() })

        return this.generateFormContainer([hdr,info,inp,iVal,btn])
    }

    requestAuthentication()
    {
        let form = this.enterCodeForm
        if (form.isValid())
        {
            this.showModal(this.ProcessingContainer, ModalCloseMode.PROGRAMMATIC)
            this.api.GET_Authentication(form.code)
            .then((res) => {
                this.deleteModal()
                if(res.errors.length > 0) {
                    res.errors.forEach((err) => {
                        this.showEphemeralMessage('fnt-msg-cntr',this.messageType.ERROR,err,10000)
                    })
                } else {
                    location.reload()
                }
            })
        }
    }

    get enterCodeForm()
    {
        let code = this.getInputValue('code')

        let isValid = () => {
            let result = true
            if (!this.isValidCode(code)) {
                result = false
                if (document.getElementById('codeValid').childElementCount === 0)
                {
                    this.showEphemeralMessage('codeValid',this.messageType.ERROR,'Invalid Code')
                }
            }
            return result
        }

        return {
            'code': code,
            'isValid': isValid
        }
    }

    //#endregion

    //#region FORM: Account Details

    get AccountContainer()
    {
        let hdr = document.createElement('div')
        hdr.classList.add('bold')
        hdr.classList.add('xlg')
        hdr.innerText = this.api.state.userName
        
        let info = document.createElement('div')
        info.classList.add('sm')
        info.innerText = 'Coming soon. This is where you will ' +
            'be able to manage account details.'

        return this.generateFormContainer([hdr,info])
    }

    //#endregion

    //#region Utility functions

    getInputValue(id)
    {
        let inputElement = document.getElementById(id)
        if (inputElement == 'undefined') return null
        return inputElement.value
    }

    isValidEmail(email)
    {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              ) !== null
    }

    isValidCode(code)
    {
        let result = true
        if (code.length !== 4) {
            result = false
        } else {
            for(let i=0; i < code.length; i++)
            {
                let parsed = parseInt(code[i])
                if (isNaN(parsed)) result = false
            }
        }
        return result
    }

    generateFormContainer(childElements = [])
    {
        let stopEvent = (event) => { event.stopPropagation() }
        let container = document.createElement('div')
        container.classList.add('fnt-container')
        container.addEventListener('click',stopEvent)
        childElements.forEach((child) => {
            container.appendChild(child)
        })
        return container
    }

    resetAll()
    {
        let e = document.getElementById('email')
        if(e) e.remove()
        e = document.getElementById('username')
        if(e) e.remove()
    }

    //#endregion

    //#region User Feedback

    get ProcessingContainer()
    {
        let hdr = document.createElement('div')
        hdr.classList.add('bold')
        hdr.classList.add('xlg')
        hdr.innerText = 'Thinking...'        
        return this.generateFormContainer([hdr])
    }

    messageType = {
        'ERROR': 'fnt-err',
        'SUCCESS': 'fnt-success',
        'WARNING': 'fnt-warn',
        'INFO': 'fnt-info'
    }

    showEphemeralMessage(parentElementId, cls, message, timeout = 2000)
    {
        let parent = document.getElementById(parentElementId)

        let msg = document.createElement('div')
        msg.classList.add(cls)
        msg.classList.add('msg')
        msg.innerText = message
        msg.addEventListener('click', () => { msg.remove() })

        setTimeout(() => { msg.remove() },timeout)
            
        parent.appendChild(msg)
    }

    initMessageCenter()
    {
        let msgCenter = document.getElementById('fnt-msg-cntr')
        if (msgCenter == null)
        {
            msgCenter = document.createElement('div')
            msgCenter.id = 'fnt-msg-cntr'
            document.querySelector("body").appendChild(msgCenter)
        }
        return msgCenter
    }

    showSuccess(message)
    {
        this.showEphemeralMessage('fnt-msg-cntr',this.messageType.SUCCESS,message, 4000)
    }

    showError(message)
    {
        this.showEphemeralMessage('fnt-msg-cntr',this.messageType.ERROR,message, 4000)
    }

    showWarning(message)
    {
        this.showEphemeralMessage('fnt-msg-cntr',this.messageType.WARNING,message, 4000)
    }

    showInfo(message)
    {
        this.showEphemeralMessage('fnt-msg-cntr',this.messageType.INFO,message, 4000)
    }

    //#region Form Modal

    showModal(container, closeMode = ModalCloseMode.EASY)
    {
        this.deleteModal()
        let body = document.querySelector("body")
        let modal = this.createModal(container, closeMode)
        body.appendChild(modal)
    }

    deleteModal()
    {
        let ele = document.getElementById('fnt-modal')
        if(ele) ele.remove()
    }

    createModal(child, closeMode)
    {
        let modal = document.createElement('div')
        modal.id = 'fnt-modal'
        modal.appendChild(child)

        if (closeMode == ModalCloseMode.EASY) {
            modal.addEventListener('click', () => { this.deleteModal() })
        } else if (closeMode == ModalCloseMode.DELIBERATE) {
            child.appendChild(this.closeModalButton)
        }

        return modal
    }

    get closeModalButton()
    {
        let ele = document.createElement('div')
        ele.id = 'fnt-close-btn'
        ele.addEventListener('click',() => {
            let modal = document.getElementById('fnt-modal')
            if (modal) modal.remove()
            let btn = document.getElementById('fnt-close-btn')
            if (btn) btn.remove()
        })
        return ele
    }

    //#endregion
    
    //#endregion
}

const ModalCloseMode = {
    /**Any mouse-up event outside the modal will close it. */
    EASY: "Easy",
    /**Only a click event on the close button will close it. */
    DELIBERATE: "Deliberate",
    /**Modal will remain open until a specified event closes it.*/
    PROGRAMMATIC: "Programmatic"
}