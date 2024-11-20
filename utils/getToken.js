const { Ability, AbilityBuilder} = require ('@casl/ability')

function getToken(req) {
    let token = req.headers.authorization
        ? req.headers.authorization.replace("Bearer ", "")
        : null;

    return token && token.length ? token : null;
}

const policies = {
    guest (user, {can}) {
        can('read', 'Product');
    },
    user (user, {can}) {
        can('view', 'Order');
        can('create', 'Order');
        can('read', 'Order', {user_id: user._id});
        can('update', 'User', {_id: user._id});
        can('read', 'Cart', {user_id: user._id});
        can('update', 'Cart', {user_id: user._id});
        can('View', 'DeliveryAddress');
        can('create', 'DeliveryAddress', {user_id: user._id});
        can('update', 'DeliveryAddress', {user_id: user._id});
        can('delete', 'DeliveryAddress', {user_id: user._id});
        can('read', 'Invoice', {user_id: user._id});
    },
    admin (user, {can}) {
        can('manage', 'all');
    },
}

const policyFor = (user) => {
    console.log("User data in policyFor:", user); // Debug user data yang diterima

    let builder = new AbilityBuilder();
    if (user && typeof policies[user.role] === 'function') {
        policies[user.role](user, builder);
    } else {
        policies.guest(user, builder);
    }

    console.log("Generated CASL rules:", builder.rules); // Debug aturan yang dibuat
    return new Ability(builder.rules);
};


module.exports =  {getToken, policyFor} ;