import React from 'react';

const LoginComponent = ({ isRegistration, onLogin, onRegistration, error, handleInputChange }) => {
    return (
        <div id="loginContainer" className="mt-5">
            <h2>{isRegistration ? 'Registration' : 'Login'}</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form>
                <div className="form-group">
                    <label htmlFor="loginInput">Login:</label>
                    <input type="text" className="form-control" id="loginInput" placeholder="Enter your login" onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="passwordInput">Password:</label>
                    <input type="password" className="form-control" id="passwordInput" placeholder="Enter your password" onChange={handleInputChange} />
                </div>
                <button type="button" className="btn btn-primary" onClick={onLogin}>
                    {isRegistration ? 'Register' : 'Login'}
                </button>
                {!isRegistration && (
                    <button type="button" className="btn btn-primary" onClick={onRegistration}>
                        Go to registration
                    </button>
                )}
            </form>
        </div>
    );
};

export default LoginComponent;
