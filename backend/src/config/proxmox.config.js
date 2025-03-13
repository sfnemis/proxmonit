/**
 * Proxmox configuration for the application
 * Defined explicitly to avoid environment variable loading issues
 */
module.exports = {
  clusters: [
    {
      id: 1,
      name: 'Main Cluster',
      host: 'https://192.168.10.2:8006',
      user: 'root@pam',
      tokenName: 'proxmonit',
      tokenValue: 'b7802a11-604b-491e-b61f-5133cbe9535a',
      verifySSL: false
    }
  ]
};