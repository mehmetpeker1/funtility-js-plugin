class FuntilityAPI
{
    constructor(data = {})
    {
        this.funtilityUi = data.hasOwnProperty('funtilityUi') ? data.funtilityUi : false

        this.displayErrorDelegate = false
        if (data.hasOwnProperty('displayErrorDelegate'))
        {
            this.displayErrorDelegate = data.displayErrorDelegate
        } else {
            if (this.funtilityUi && !this.displayErrorDelegate) 
            {
                this.displayErrorDelegate = this.funtilityUi.displayError
            } else {
                this.displayErrorDelegate = alert
            }
        }

        this.apiBaseUrl = 'localhost:5194/api/v1/'
        this.getQuerySessionToken()
        this.sessionToken = this.getLocalSessionToken()
    }

    getQuerySessionToken()
    {
        const search = window.location.search.substring(1)
        if (search != '') {
            search.split('&').forEach(n => {
                let param = n.split('=')
                if (param[0] == 'jwt'){
                    localStorage.setItem('funtilitySessionToken',param[1])
                }
            })
        }
    }

    getLocalSessionToken()
    {
        let s = localStorage.getItem('funtilitySessionToken')
        if (!s)
        {
            s = ''
            localStorage.setItem('funtilitySessionToken',s)
        }
        return s
    }

    /**
     * Use this method to register a new user account with Funtility.
     * @param {FuntilityRegistrationForm} funtilityRegistrationForm Required to register a new user account.
     */
    registerNewUser(funtilityRegistrationForm)
    {
        let init = this.getInit("POST",funtilityRegistrationForm)
        fetch("account/register",init).then(response => this.handleResponse(response))
    }

    login(funtilityLoginForm)
    {
        // let init = this.getInit(RequestMethods.POST,funtilityLoginForm)
        // let endpoint = `${this.apiBaseUrl}account/login`
        // fetch(endpoint,init)
        // .then(response => {
        //     if(this.hasErrors(response))
        //     {
        //         this.handleErrors(response)
        //     } else {
        //         // retrieve the JWT from the response
        //     }
        // })
        // .catch(error => {
        //     console.error(error)
        // })
    }

    GET(endpoint)
    {
        let init = getInit("GET")
        return this.request(endpoint,init)
    }
    
    PUT(endpoint,body)
    {
        let init = getInit("PUT",body)
        return this.request(endpoint,init)
    }
    
    POST(endpoint,body)
    {
        let init = getInit("POST",body)
        return this.request(endpoint,init)
    }
    
    DELETE(endpoint)
    {
        let init = getInit("DELETE")
        return this.request(endpoint,init)
    }

    getInit(method, body = {})
    {
        if (method == "GET" || method == "DELETE") {
            return {
                method: method,
                headers: this.getHeaders(),
                mode: 'cors'
            }
        } else {
            return {
                method: method,
                body: JSON.stringify(body),
                headers: this.getHeaders(),
                mode: 'cors'
            }
        }
    }
    
    getHeaders()
    {
        let result = new Headers()
        result.append('Authorization', `bearer ${this.sessionToken}`);
        return result
    }

    request(endpoint,init)
    {
        let result = false
        fetch(`${this.apiBaseUrl}${endpoint}`,init)
        .then(response => {
            if (response.status != 200) 
            {
                this.displayErrorDelegate('Oh no! There was a problem!')
            } else {
                let apiResObj = response.json()
                if (this.hasErrors(apiResObj))
                {
                    if (this.displayErrorDelegate == alert)
                    {
                        apiResObj.errors.forEach((err) => {
                            this.displayErrorDelegate(err)
                        })
                    } else {
                        this.displayErrorDelegate(err)
                    }
                } else {
                    result = apiResObj.result
                }
            }
        })
        .catch(error => {
            this.displayErrorDelegate('Oh no! There was an error!')
            console.error(error)
        })
        return result
    }

    hasErrors(response)
    {
        if(!response) return false
        if(typeof(errors) == 'object' && errors.length != 'undefined')
        {
            return errors.length > 0
        }
        return false
    }
}

/**
 * Use this class to register a new user with Funtility
 */
class FuntilityRegistrationForm
{
    constructor(data = {})
    {
        this.userName = data.hasOwnProperty('userName') ? data.userName : "Guest"
        this.password = data.hasOwnProperty('password') ? data.password : null
        this.email = data.hasOwnProperty('email') ? data.email : null
    }
}

class FuntilityLoginForm
{
    constructor(data = {})
    {
        this.email = data.hasOwnProperty('email') ? data.email : null
        this.password = data.hasOwnProperty('password') ? data.password : null
    }
}
