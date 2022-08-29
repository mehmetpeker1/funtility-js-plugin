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
        let leftBtn = this.signInButton
        let divider = new Ele('span').InnerText(' | ').Element
        let rightBtn = this.signUpButton
        
        if (this.api.userIsSignedIn)
        {
            leftBtn = this.userNameButton
            rightBtn = this.signOutButon
        }
        this.funtilityElement([leftBtn,divider,rightBtn])
    }

    funtilityElement(childElements = [])
    {
        let ele = document.getElementById('funtility')
        ele.innerHTML = null
        ele.appendChild(new Ele('div')
            .AppendChildren(childElements)
            .Element)
    }

    get userNameButton()
    {
        return new Ele('span')
            .InnerText(this.api.state.userName)
            .AddClass('fnt-hover')
            .Event_Click(() => { this.showModal(this.AccountContainer, ModalCloseMode.EASY) })
            .Element
    }

    get signOutButon()
    {
        return new Ele('span')
            .InnerText('Sign Out')
            .AddClass('fnt-hover')
            .Event_Click(() => {
                if(confirm("Are you sure you want to sign out?"))
                {
                    this.api.signOut()
                    this.init()
                }
            })
            .Element
    }

    get signInButton()
    {
        return new Ele('span')
            .InnerText('Sign In')
            .AddClass('fnt-hover')
            .Event_Click(() => { this.showModal(this.SignInContainer) })
            .Element
    }

    get signUpButton()
    {
        return new Ele('span')
            .InnerText('Sign Up')
            .AddClass('fnt-hover')
            .Event_Click(() => { this.showModal(this.SignUpContainer) })
            .Element
    }

    //#endregion

    //#region FORM: Sign Up

    get SignUpContainer()
    {
        this.resetAll()

        let hdr = new Ele('div')
            .InnerText('Sign Up For')
            .AddClass('xlg')
            .Element
        
        let app = new Ele('div')
            .InnerText(this.api.appName)
            .AddClass('xlg bold')
            .Element

        let br = new Ele('br')
            .AddClass('fnt-hgt-20')
            .Element

        let inEmail = new Ele('input')
            .Placeholder('Email')
            .AddClass('fnt-input fnt-wid-200')
            .Id('email')
            .Type('email')
            .Element
            
        let iVal1 = new Ele('div')
            .AddClass('fnt-hgt-20')
            .Id('emailValid')
            .Element

        let inUser = new Ele('input')
            .Placeholder('User Name')
            .AddClass('fnt-input fnt-wid-200')
            .Id('username')
            .Type('text')
            .Element
            
        let iVal2 = new Ele('div')
            .AddClass('fnt-hgt-20')
            .Id('usernameValid')
            .Element

        let btn = new Ele('button')
            .InnerText('Submit')
            .Id('signUpFormButton')
            .AddClass('fnt-button fnt-wid-200 xxlg tx-ctr')
            .Event_Click((e) => { this.requestUserAccount() })
            .Element

        return this.generateFormContainer([hdr,app,br,inEmail,iVal1,inUser,iVal2,btn])
    }

    requestUserAccount()
    {
        let form = this.signUpForm
        if (form.isValid())
        {
            this.showModal(this.ProcessingContainer, ModalCloseMode.PROGRAMMATIC)
            this.api.POST_UserAccount(form.email,form.username)
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
        let hdr = new Ele('div')
            .InnerText('Sign In to')
            .AddClass('xlg')
            .Element
        
        let app = new Ele('div')
            .InnerText(this.api.appName)
            .AddClass('xlg bold')
            .Element
        
        let info = new Ele('div')
            .InnerText("We'll email a sign in code.")
            .Element

        let inp = new Ele('input')
            .Placeholder('Email')
            .AddClass('fnt-input fnt-wid-200')
            .Id('email')
            .Type('email')
            .Element
        
        if (this.api.accountEmail) inp.value = this.api.accountEmail

        let iVal = new Ele('div')
            .AddClass('fnt-hgt-20')
            .Id('emailValid')
            .Element

        let btn = new Ele('button')
            .Id('signInFormButton')
            .InnerText('Continue')
            .AddClass('fnt-button fnt-wid-200 xxlg tx-ctr')
            .Event_Click((e) => { this.requestSignInCode(email) })
            .Element

        return this.generateFormContainer([hdr,app,info,inp,iVal,btn])
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
                    this.showModal(this.EnterCodeContainer)
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
        let hdr = new Ele('div')
            .AddClass('bold xlg')
            .InnerText('Enter the code')
            .Element
        
        let info = new Ele('p')
            .InnerText('If that email address exists in our system, ' +
                'you should recieve an email with a code to sign in.')
            .AddClass('sm')
            .Element

        let inp = new Ele('input')
            .Id('code')
            .Placeholder('Code')
            .AddClass('fnt-input fnt-wid-200 xxlg tx-ctr')
            .Element
            
        let iVal = new Ele('div')
            .AddClass('fnt-hgt-20')
            .Id('codeValid')
            .Element

        let btn = new Ele('button')
            .Id('enterCodeButton')
            .InnerText('Submit')
            .Event_Click((e) => { this.requestAuthentication() })
            .AddClass('fnt-button fnt-wid-200 xxlg tx-ctr')
            .Element

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
                    this.init()
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
        let hdr = new Ele('div')
            .AddClass('bold xlg')
            .InnerText(this.api.state.userName)
            .Element
        
        let info = new Ele('p')
            .InnerText('Coming soon. This is where you will' +
                'be able to manage account details.')
            .AddClass('sm')
            .Element

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

    // disableButton(id)
    // {
    //     let b = document.getElementById(id)
    //     if(b !== null && b !== 'undefined')
    //     {
    //         b.setAttribute('disabled',true)
    //     }
    // }

    generateFormContainer(childElements = [])
    {
        let stopEvent = (event) => { event.stopPropagation() }

        let container = new Ele('div')
            .AddClass('fnt-container')
            .Event_Click(stopEvent)
            .Element

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
        let hdr = new Ele('div')
            .AddClass('bold xlg')
            .InnerText('Thinking...')
            .Element
        
        return this.generateFormContainer([hdr])
    }

    messageType = {
        'ERROR': 'fnt-err'
    }

    showEphemeralMessage(parentElementId, cls, message, timeout = 2000)
    {
        let parent = document.getElementById(parentElementId)

        let msg = new Ele('div')
            .AddClass(`${cls} msg`)
            .InnerText(message)
            .Event_Click(() => { msg.remove() })
            .Element

        setTimeout(() => { msg.remove() },timeout)
            
        parent.appendChild(msg)
    }

    initMessageCenter()
    {
        let msgCenter = document.getElementById('fnt-msg-cntr')
        if (msgCenter == null)
        {
            msgCenter = new Ele('div').Id('fnt-msg-cntr').Element
            document.querySelector("body").appendChild(msgCenter)
        }
        return msgCenter
    }

    //#endregion

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
        let modal = new Ele('div')
            .Id('fnt-modal')
            .AppendChild(child)

        if (closeMode == ModalCloseMode.EASY) {
            modal.Event_Click(() => { this.deleteModal() })
        } else if (closeMode == ModalCloseMode.DELIBERATE) {
            child.appendChild(this.closeModalButton)
        }

        return modal.Element
    }

    get closeModalButton()
    {
        let fn = () => {
            let modal = document.getElementById('fnt-modal')
            if (modal) modal.remove()
            let btn = document.getElementById('fnt-close-btn')
            if (btn) btn.remove()
        }

        return new Ele('div')
            .Id('fnt-close-btn')
            .Event_Click(fn)
            .Element
    }
    
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