import React from 'react';

const RegisterComponent = ({ onRegister, onGoToLogin, error, handleInputChange }) => {
    return (
        <div id="registerContainer" className="mt-5">
            <h2>Registration</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form>
                <div className="form-group">
                    <label htmlFor="loginInputRegistration">Login:</label>
                    <input type="text" className="form-control" id="loginInputRegistration" placeholder="Enter your login" onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="passwordInputRegistration">Password:</label>
                    <input type="password" className="form-control" id="passwordInputRegistration" placeholder="Enter your password" onChange={handleInputChange} />
                </div>
                <button type="button" className="btn btn-primary" onClick={onRegister}>
                    Register
                </button>
                <button type="button" className="btn btn-secondary" onClick={onGoToLogin}>
                    Back to Login
                </button>
            </form>
        </div>
    );
};

export default RegisterComponent;
