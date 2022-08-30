class ApiResponse
{
    constructor(data = {})
    {
        this.errors = data.hasOwnProperty('errors') ? data.errors : []
        this.result = data.hasOwnProperty('result') ? data.result : {}
    }

    get hasErrors()
    {
        return this.errors.length > 0
    }
}

class FuntilityApiState
{
    constructor(data = {})
    {
        this.authToken = data.hasOwnProperty('authToken') ? data.authToken : null
        this.createDate = data.hasOwnProperty('createDate') ? data.createDate : null
        this.userName = data.hasOwnProperty('userName') ? data.userName : null
    }
}

class FuntilityAPI
{
    constructor(appName = null)
    {
        if(appName === null) throw "FuntilityAPI requires the name of the app using it."
        this.appName = appName
        this.stateName = appName.replace(/\s+/g, '')

        this.state = new FuntilityApiState()
        this.syncLocalStorage()

        this.accountEmail = ''
        this.signInCodePrefix = ''
        this.apiBaseUrl = 'http://localhost:5194/'
    }

    syncLocalStorage(push = false){
        if (push)
        {
            localStorage.setItem(this.stateName,JSON.stringify(this.state))
        } else {
            let state = localStorage.getItem(this.stateName)
            if (!state)
            {
                localStorage.setItem(this.stateName,JSON.stringify(this.state))
            }
            else
            {
                this.state = new FuntilityApiState(JSON.parse(state))
            }
        }
    }

    clearState()
    {
        this.state = new FuntilityApiState()
        this.syncLocalStorage(true)
    }

    get userIsSignedIn()
    {
        let result = true
        if (this.state.authToken !== null) {
            try
            {
                let token = this.parseJwt(this.state.authToken)
                if(this.isExpired(token.expirey))
                {
                    // this.clearState()
                    result = false
                }
            } catch {
                result = false
            }
        } else { 
            result = false
        }
        return result
    }

    parseJwt(token)
    {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    isExpired(expirey)
    {
        let utcNow = this.getUTCNowAsCustomString()
        let result = expirey < utcNow
        return result
    }

    getUTCNowAsCustomString()
    {
        const d = new Date()
        const yyyy = d.getUTCFullYear().toString()
        const MM = (d.getUTCMonth() + 1).toString().padStart(2,'0')
        const dd = d.getUTCDate().toString().padStart(2,'0')
        const hh = d.getUTCHours().toString().padStart(2,'0')
        const mm = d.getUTCMinutes().toString()
        return `${yyyy}${MM}${dd}${hh}${mm}`
    }

    signOut()
    {
        this.accountEmail = ''
        this.signInCodePrefix = ''
        this.clearState()
    }

    //#region Funtility Account Related Endpoints

    /**
     * Registers a new user account with Funtility.
     * @param email Required to register a new user account.
     * Must be unique; no two accounts may have the same email.
     * @param userName Required to register a new user account.
     * Must be unique; no two accounts may have the same user name.
     * @return {ApiResponse} A promise that resolves to an instance of ApiResponse
     */
    async POST_UserAccount(email, userName)
    {
        this.clearState()
        let body = {
            "Email": email,
            "UserName": userName,
            "AppName": this.appName
        }
        let r = await this.POST("UserAccount",body)
        return new ApiResponse(r)
    }

    /**
     * Email a sign in code to a registered user.
     * @param {string} email Required. The email of the registered user.
     * @return {ApiResponse} A promise that resolves to an instance of ApiResponse
     */
    async GET_LoginCode(email)
    {
        this.clearState()
        this.accountEmail = email
        let params = [
            ['email',email],
            ['appName',this.appName]
        ]
        let r = await this.GET("LoginCode", params)
        this.signInCodePrefix = r.result.code
        return new ApiResponse({ 'errors': r.errors, 'result': r.result })
    }

    /**
     * Use this method to sign the user in.
     * @param {string} code The code sent to the user's email.
     * @return {ApiResponse} A promise that resolves to an instance of ApiResponse
     */
    async GET_Authentication(code)
    {
        this.clearState()
        let params = [
            ["code",`${this.signInCodePrefix}.${code}`],
            ["email",this.accountEmail]
        ]
        let r = await this.GET("Authentication",params)
        this.signInCodePrefix = ''
        this.state = new FuntilityApiState(r.result)
        this.syncLocalStorage(true)
        return new ApiResponse({ 'errors': r.errors, 'result': true })
    }

    //#endregion

    //#region Funtility General Request Methods

    /**
     * 
     * @param {string} endpoint
     * The string value of the endpoint without
     * the leading slash. This will be appended
     * to the base Funtility API URL.
     * @param {[[string,string]]} params 
     * A two dimensional array of key value pairs: 
     * E.G. [ [ "id" , 10 ] ]
     * @returns 
     * See the Funtility API documentation for
     * the return type of the endpoint.
     */
    async GET(endpoint,params = [])
    {
        let init = this.getInit("GET")
        endpoint = `${endpoint}${this.getQueryParamString(params)}`
        const data = await this.request(endpoint, init)
        return new ApiResponse(data)
    }
    
    /**
     * 
     * @param {string} endpoint
     * The string value of the endpoint without
     * the leading slash. This will be appended
     * to the base Funtility API URL.
     * @param {[[string,string]]} params 
     * A two dimensional array of key value pairs: 
     * E.G. [ [ "id" , 10 ] ]
     * @returns 
     * See the Funtility API documentation for
     * the return type of the endpoint.
     */
    async PUT(endpoint,body,params = [])
    {
        let init = this.getInit("PUT",body)
        endpoint = `${endpoint}${this.getQueryParamString(params)}`
        const data = await this.request(endpoint, init)
        return new ApiResponse(data)
    }
    
    /**
     * 
     * @param {string} endpoint
     * The string value of the endpoint without
     * the leading slash. This will be appended
     * to the base Funtility API URL.
     * @param {[[string,string]]} params 
     * A two dimensional array of key value pairs: 
     * E.G. [ [ "id" , 10 ] ]
     * @returns 
     * See the Funtility API documentation for
     * the return type of the endpoint.
     */
    async POST(endpoint,body)
    {
        let init = this.getInit("POST",body)
        const data = await this.request(endpoint, init)
        return new ApiResponse(data)
    }
    
    /**
     * 
     * @param {string} endpoint
     * The string value of the endpoint without
     * the leading slash. This will be appended
     * to the base Funtility API URL.
     * @param {[[string,string]]} params 
     * A two dimensional array of key value pairs: 
     * E.G. [ [ "id" , 10 ] ]
     * @returns 
     * See the Funtility API documentation for
     * the return type of the endpoint.
     */
    async DELETE(endpoint,params = [])
    {
        let init = this.getInit("DELETE")
        endpoint = `${endpoint}${this.getQueryParamString(params)}`
        const data = await this.request(endpoint, init)
        return new ApiResponse(data)
    }

    //#region (private) Request Helper Methods

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
        result.append('Authorization', `bearer ${this.state.authToken}`)
        result.append('Content-Type', 'application/json;charset=UTF-8')
        return result
    }

    getQueryParamString(params)
    {
        let result = params.length > 0 ? "?" : ""
        params.forEach(keyVal => {
            let amp = result === "?" ? "" : "&"
            result = `${result}${amp}${keyVal[0]}=${keyVal[1]}`
        })
        return result
    }

    async request(endpoint,init)
    {
        const res = await fetch(`${this.apiBaseUrl}${endpoint}`, init)
        return await res.json()
    }

    //#endregion

    //#endregion
}
