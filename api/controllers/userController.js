//3.0
module.exports = {
	profile: function(req, res) {
		return res.json(req.user);
}